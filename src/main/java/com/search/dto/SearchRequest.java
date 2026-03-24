package com.search.dto;

import java.util.Collections;
import java.util.List;

public class SearchRequest {
    private String query;
    private List<ResultType> types;
    private int offset = 0;
    private int limit = 10;

    public SearchRequest() {
    }

    public SearchRequest(String query, List<ResultType> types, int offset, int limit) {
        this.query = query;
        this.types = types;
        this.offset = offset;
        this.limit = limit;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<ResultType> getTypes() {
        return types == null ? Collections.emptyList() : types;
    }

    public void setTypes(List<ResultType> types) {
        this.types = types;
    }

    public int getOffset() {
        return Math.max(0, offset);
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public int getLimit() {
        return Math.max(1, Math.min(limit, 50));
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }
}

