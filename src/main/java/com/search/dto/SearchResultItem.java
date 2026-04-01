package com.search.dto;

public record SearchResultItem(Long id, ResultType type, String label, String description, double score) {
}

