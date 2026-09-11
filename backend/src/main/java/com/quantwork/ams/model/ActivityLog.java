package com.quantwork.ams.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "activity_logs")
public class ActivityLog {
    @Id
    private String id;
    private String companyId;
    private String title;
    private String assetTag;
    private String timestamp;
    private String user;
    private String actionType;
}
