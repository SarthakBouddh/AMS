package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;
    private String companyId;
    private String companyName;
    private String name;
    private String type; // MEETING_ROOM, PROJECTOR, VEHICLE, DEV_DEVICE, SOFTWARE_LICENSE, TEST_ENV
    private String location;
    private String capacityInfo;
    private String status; // AVAILABLE, RESERVED, MAINTENANCE
    private String specifications;

    public Resource() {}

    public Resource(String id, String companyId, String companyName, String name, String type, String location, String capacityInfo, String status, String specifications) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.name = name;
        this.type = type;
        this.location = location;
        this.capacityInfo = capacityInfo;
        this.status = status;
        this.specifications = specifications;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCapacityInfo() { return capacityInfo; }
    public void setCapacityInfo(String capacityInfo) { this.capacityInfo = capacityInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
}
