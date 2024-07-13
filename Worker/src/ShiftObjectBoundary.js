class ObjectBoundary {
    constructor(type, alias, active,  createdBy, objectDetails) {

        this.type = type;
        this.alias = alias;
        this.active = active;
        this.createdBy = createdBy;
        this.objectDetails = objectDetails;
    }

    // Method to toggle active status
    toggleActive() {
        this.active = !this.active;
    }
}

function jsonToObjectBoundary(jsonString) {
    const jsonObj = JSON.parse(jsonString);
    return new ObjectBoundary(
        jsonObj.objectId,
        jsonObj.type,
        jsonObj.alias,
        jsonObj.location,
        jsonObj.active,
        jsonObj.creationTimestamp,
        jsonObj.createdBy,
        jsonObj.objectDetails
    );
}

// Usage example:
const exampleJson = `{
  "objectId": {"superapp": "2024b.Tal.Mizrahi", "id": "1"},
  "type": "exampleType",
  "alias": "exampleAlias",
  "location": {"lat": 10, "lng": 20},
  "active": true,
  "creationTimestamp": "2024-07-08T17:46:01.646Z",
  "createdBy": {"userId": {"superapp": "2024b.Tal.Mizrahi", "email": "example@email.com"}},
  "objectDetails": {"additionalProp1": {}, "additionalProp2": {}, "additionalProp3": {}}
}`;


