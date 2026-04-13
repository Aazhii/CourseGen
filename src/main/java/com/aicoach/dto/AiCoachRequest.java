package com.aicoach.dto;

import java.util.List;

public class AiCoachRequest {

    private Long courseId;
    private Long lessonId;
    private String message;
    private List<String> previousQuizQuestions;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getPreviousQuizQuestions() {
        return previousQuizQuestions;
    }

    public void setPreviousQuizQuestions(List<String> previousQuizQuestions) {
        this.previousQuizQuestions = previousQuizQuestions;
    }
}

