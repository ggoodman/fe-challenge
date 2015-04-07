// your code here

angular.module("newsie", [
  "ui.bootstrap",
])

.factory("userData", ["$http", function ($http) {
  function UserData () {
    // The raw user data from the server
    // Map of userId => userData
    this.users = {};
    
    // Promise: Loading user data
    this.loading = null;
  }
  
  UserData.prototype.getUserById = function (userId) {
    var self = this;
    
    return this.loadUsers()
      .then(function () {
        var user = self.users[userId];
        
        if (!user) throw new Error("User not found: " + userId);
        
        return user;
      });
  };
  
  UserData.prototype.handleUserData = function (response) {
    var self = this;
    var data = response.data;
    
    angular.forEach(data, function (userData) {
      self.users[userData.accountId] = userData;
    });
    
    return this;
  };
  
  UserData.prototype.handleUserError = function (error) {
    alert("Error loading user data: '" + (error.message || error) + "'");
  };
  
  UserData.prototype.loadUsers = function () {
    var self = this;
    
    if (!this.loading) {
      this.loading = $http.get("accounts.json")
        .then(self.handleUserData.bind(self))
        .then(function () {
          self.loaded = true;
          
          return self;
        })
        .catch(self.handleUserError.bind(self));
    }
    
    return this.loading;
  };
  
  var userData = new UserData();
  
  return userData;
}])

.factory("newsData", ["$http", "$q", "userData", function ($http, $q, userData) {
  function NewsData () {
    // The un-filtered raw feed data.
    this.feed = [];
    
    // The active eventType filters to selectively display feed items
    this.filter = {};
    
    // What is the active search term for data to be filtered on?
    this.searchTerm = "";
    
    // Promise: Resolves to feed data or feed loading error
    this.loading = null;
  }
  
  NewsData.prototype.handleNewsData = function (response) {
    this.feed.length = 0;
    
    var self = this;
    var data = response.data;
    var promises = [];
    
    angular.forEach(data, function (newsItemData) {
      var promise = userData.getUserById(newsItemData.accountId)
        .then(function (user) {
          self.feed.push({
            user: user,
            time: new Date(newsItemData.time),
            eventType: newsItemData.event.eventType,
            snippet: newsItemData.event.snippet,
          });
        });
      
      promises.push(promise);
    });
      
    return $q.all(promises);
  };
  
  NewsData.prototype.handleNewsError = function (error) {
    alert("Error loading news data: '" + (error.message || error) + "'");
  };
  
  NewsData.prototype.loadNews = function () {
    var self = this;
    
    if (!this.loading) {
      this.loading = $http.get("events.json")
        .then(self.handleNewsData.bind(self))
        .then(function () {
          self.loaded = true;
          
          return self;
        })
        .catch(self.handleNewsError.bind(self));
    }
    
    return this.loading;
  };
  
  NewsData.prototype.updateSearchTerm = function (searchTerm) {
    console.log("newsData.updateSearchTerm", searchTerm);
    this.searchTerm = searchTerm;
  };
  
  
  var news = new NewsData();
  
  return news;
  
}])


.controller("SidebarController", ["newsData", function (newsData) {
  var sidebar = this;
  
  sidebar.debounceDelay = 100;
  sidebar.searchInputValue = "";
  sidebar.searchInput = function (setValue) {
    if (typeof setValue !== "undefined") {
      // this is a setter
      
      sidebar.searchInputValue = setValue;
      
      newsData.updateSearchTerm(sidebar.searchInputValue);
    } else {
      // this is a getter
      
      return sidebar.searchInputValue;
    }
  };
  
}])

.controller("NewsFeedController", ["newsData", function (newsData) {
  var feed = this;
  
  // Bool: is the news loaded
  feed.loading = false;
  
  feed.filteredItems = function (value, index) {
    console.log("feed.filteredItems", newsData.searchTerm, value.snippet.indexOf(newsData.searchTerm) >= 0);
    
    return !newsData.searchTerm || (value.snippet.indexOf(newsData.searchTerm) >= 0);
  };
  
  feed.loadData = function () {
    console.log("feed.loadData")
    feed.loading = true;
    
    newsData.loadNews()
      .then(function () {
        console.log("feed.loadData.resolve", newsData.feed);
        
        feed.loading = false;
        feed.items = newsData.feed;
        
        console.log("feed.loadData.resolve", feed)
      });
  };
  
  feed.loadData();
  
}]);