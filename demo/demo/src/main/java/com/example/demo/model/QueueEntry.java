package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String queueNo;
    private String studentName;
    private String status;
    private String priority;
    private int waitTime;

    public QueueEntry() {}

    public QueueEntry(String queueNo, String studentName, String status, String priority, int waitTime) {
        this.queueNo = queueNo;
        this.studentName = studentName;
        this.status = status;
        this.priority = priority;
        this.waitTime = waitTime;
    }

    // Getters and setters ...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQueueNo() { return queueNo; }
    public void setQueueNo(String queueNo) { this.queueNo = queueNo; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public int getWaitTime() { return waitTime; }
    public void setWaitTime(int waitTime) { this.waitTime = waitTime; }
}
