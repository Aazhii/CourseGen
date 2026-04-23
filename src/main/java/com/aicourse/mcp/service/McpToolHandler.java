package com.aicourse.mcp.service;

import com.fasterxml.jackson.databind.JsonNode;

public interface McpToolHandler {

    String toolName();

    String description();

    JsonNode execute(JsonNode input, McpExecutionContext context) throws Exception;
}

