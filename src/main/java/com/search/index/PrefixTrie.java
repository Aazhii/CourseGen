package com.search.index;

import java.util.*;

public class PrefixTrie {
    private final Node root = new Node();

    public void insert(String term) {
        if (term == null || term.isBlank()) {
            return;
        }
        String normalized = term.toLowerCase();
        Node current = root;
        for (char c : normalized.toCharArray()) {
            current = current.children.computeIfAbsent(c, k -> new Node());
        }
        current.isTerminal = true;
        current.hits++;
    }

    public List<String> suggest(String prefix, int limit) {
        if (prefix == null || prefix.isBlank()) {
            return Collections.emptyList();
        }
        String normalized = prefix.toLowerCase();
        Node current = root;
        for (char c : normalized.toCharArray()) {
            current = current.children.get(c);
            if (current == null) {
                return Collections.emptyList();
            }
        }
        List<Suggestion> results = new ArrayList<>();
        dfs(current, new StringBuilder(normalized), results, limit);
        List<String> terms = new ArrayList<>();
        for (Suggestion suggestion : results) {
            terms.add(suggestion.term);
        }
        return terms;
    }

    private void dfs(Node node, StringBuilder builder, List<Suggestion> results, int limit) {
        if (results.size() >= limit) {
            return;
        }
        if (node.isTerminal) {
            results.add(new Suggestion(builder.toString(), node.hits));
        }
        for (Map.Entry<Character, Node> entry : node.children.entrySet()) {
            builder.append(entry.getKey());
            dfs(entry.getValue(), builder, results, limit);
            builder.setLength(builder.length() - 1);
            if (results.size() >= limit) {
                break;
            }
        }
        results.sort((a, b) -> Integer.compare(b.hits, a.hits));
        if (results.size() > limit) {
            results.subList(limit, results.size()).clear();
        }
    }

    private static class Node {
        private final Map<Character, Node> children = new HashMap<>();
        private boolean isTerminal;
        private int hits = 0;
    }

    private record Suggestion(String term, int hits) {
    }
}

