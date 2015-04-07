describe("Unit: NewsData", function () {
  // Include Modules
  beforeEach(module('newsie'));
  
  var mockValidData = [
   {
      "accountId":0,
      "event":{
         "eventType":"Graduation",
         "snippet":"Graduated from nd001!"
      },
      "time":1435302000000
   },
   {
      "accountId":1,
      "event":{
         "eventType":"Project Completion",
         "snippet":"Completed project 0!"
      },
      "time":1434006000000
   }
  ];

 // Instantiate global variables (global to all tests in this describe block).
  var newsData;
  var $httpBackend;
  
  // Suite for testing an individual piece of our feature.

  // Inject dependencies
  beforeEach(inject(function (_newsData_, _$httpBackend_) {
    newsData = _newsData_;
    $httpBackend = _$httpBackend_;
  }));

  describe('userData.loadUsers requests events.json', function () {
    // Inject dependencies
    beforeEach(inject(function () {
      $httpBackend.when("events.json")
        .respond(mockValidData)
    }));
    
    it("should hit events.json", function () {
      $httpBackend.expectGET("events.json");
      
      newsData.loadNews();
      
      $httpBackend.flush();
    });
    
  });
    
})