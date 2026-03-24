package com.search.service.impl;

import com.aicourse.model.Course;
import com.aicourse.model.Users;
import com.aicourse.repo.CourseRepo;
import com.aicourse.repo.UserRepo;
import com.search.dto.*;
import com.search.index.PrefixTrie;
import com.search.model.SearchDocument;
import com.search.service.SearchService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

@Service
public class SearchServiceImpl implements SearchService {

    private final CourseRepo courseRepo;
    private final UserRepo userRepo;

    private final Map<String, SearchDocument> documents = new HashMap<>();
    private final Map<String, Set<String>> invertedIndex = new HashMap<>();
    private final PrefixTrie trie = new PrefixTrie();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();

    public SearchServiceImpl(CourseRepo courseRepo, UserRepo userRepo) {
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
    }

    @PostConstruct
    public void initialize() {
        refreshAllIndices();
    }

    @Override
    public SearchResponse search(SearchRequest request) {
        if (request == null || request.getQuery() == null || request.getQuery().isBlank()) {
            return new SearchResponse(Collections.emptyList(), 0);
        }

        List<String> tokens = tokenize(request.getQuery());
        if (tokens.isEmpty()) {
            return new SearchResponse(Collections.emptyList(), 0);
        }

        Set<ResultType> typeFilter = new HashSet<>(request.getTypes());

        lock.readLock().lock();
        try {
            Set<String> candidateKeys = new HashSet<>();
            for (String token : tokens) {
                Set<String> keys = invertedIndex.get(token);
                if (keys != null) {
                    candidateKeys.addAll(keys);
                }
            }

            List<SearchResultItem> scored = new ArrayList<>();
            OffsetDateTime now = OffsetDateTime.now();

            for (String key : candidateKeys) {
                SearchDocument doc = documents.get(key);
                if (doc == null) {
                    continue;
                }
                if (!typeFilter.isEmpty() && !typeFilter.contains(doc.getType())) {
                    continue;
                }
                double score = computeScore(doc, tokens, now);
                scored.add(new SearchResultItem(doc.getId(), doc.getType(), doc.getTitle(), doc.getDescription(), score));
            }

            scored.sort((a, b) -> {
                int scoreCompare = Double.compare(b.score(), a.score());
                if (scoreCompare != 0) {
                    return scoreCompare;
                }
                return a.label().compareToIgnoreCase(b.label());
            });

            int offset = request.getOffset();
            int limit = request.getLimit();
            int from = Math.min(offset, scored.size());
            int to = Math.min(from + limit, scored.size());
            List<SearchResultItem> paged = scored.subList(from, to);

            return new SearchResponse(paged, scored.size());
        } finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public AutocompleteResponse autocomplete(String prefix, List<ResultType> types, int limit) {
        int resolvedLimit = Math.max(1, Math.min(limit, 20));
        Set<ResultType> typeFilter = types == null ? Collections.emptySet() : new HashSet<>(types);

        lock.readLock().lock();
        try {
            List<String> suggestions = trie.suggest(prefix, resolvedLimit);
            SearchRequest quickRequest = new SearchRequest(prefix, new ArrayList<>(typeFilter), 0, resolvedLimit);
            SearchResponse quickResults = search(quickRequest);
            return new AutocompleteResponse(suggestions, quickResults.results());
        } finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public void refreshAllIndices() {
        lock.writeLock().lock();
        try {
            documents.clear();
            invertedIndex.clear();

            for (Course course : courseRepo.findAll()) {
                if (!course.isActive()) {
                    continue;
                }
                indexCourse(course);
            }

            for (Users user : userRepo.findAll()) {
                indexUser(user);
            }
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void indexCourse(Course course) {
        String title = safe(course.getTitle());
        String description = safe(course.getDescription());
        Set<String> tokens = tokenize(title + " " + description).stream().collect(Collectors.toSet());
        double popularityWeight = 1.0;

        SearchDocument doc = new SearchDocument(
                course.getId(),
                ResultType.COURSE,
                title,
                description,
                null,
                popularityWeight,
                tokens
        );
        indexDocument(doc);
    }

    private void indexUser(Users user) {
        String title = safe(user.getUsername());
        Set<String> tokens = tokenize(title).stream().collect(Collectors.toSet());
        double popularityWeight = 0.5;

        SearchDocument doc = new SearchDocument(
                user.getId(),
                ResultType.USER,
                title,
                "User",
                user.getCreatedAt(),
                popularityWeight,
                tokens
        );
        indexDocument(doc);
    }

    private void indexDocument(SearchDocument doc) {
        documents.put(doc.getKey(), doc);
        for (String token : doc.getTokens()) {
            invertedIndex.computeIfAbsent(token, k -> new HashSet<>()).add(doc.getKey());
            trie.insert(token);
        }
    }

    private List<String> tokenize(String input) {
        if (input == null || input.isBlank()) {
            return Collections.emptyList();
        }
        String normalized = input.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9 ]", " ");
        String[] parts = normalized.split("\\s+");
        List<String> tokens = new ArrayList<>();
        for (String part : parts) {
            if (part.length() >= 2) {
                tokens.add(part);
            }
        }
        return tokens;
    }

    private double computeScore(SearchDocument doc, List<String> queryTokens, OffsetDateTime now) {
        if (doc.getTokens().isEmpty()) {
            return 0;
        }
        int matches = 0;
        for (String token : queryTokens) {
            if (doc.getTokens().contains(token)) {
                matches++;
            }
        }
        double coverage = matches / (double) queryTokens.size();
        double recencyBoost = 0;
        if (doc.getCreatedAt() != null) {
            long ageDays = Math.max(0, ChronoUnit.DAYS.between(doc.getCreatedAt(), now));
            recencyBoost = 1.0 / (1 + ageDays);
        }
        return (coverage * 0.7) + (doc.getPopularityWeight() * 0.2) + (recencyBoost * 0.1);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}


