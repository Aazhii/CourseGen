package com.search.service;

import com.search.dto.AutocompleteResponse;
import com.search.dto.ResultType;
import com.search.dto.SearchRequest;
import com.search.dto.SearchResponse;

import java.util.List;

public interface SearchService {
    SearchResponse search(SearchRequest request);

    AutocompleteResponse autocomplete(String prefix, List<ResultType> types, int limit);

    void refreshAllIndices();
}

