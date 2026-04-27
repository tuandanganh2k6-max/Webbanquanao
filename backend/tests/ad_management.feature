Feature: Advertisement Management for Admin

  As an Admin
  I want to manage advertising contracts and banners
  To ensure the website shows valid and sponsored content

  Scenario: Successfully create a new advertisement
    Given I am authenticated as an Admin
    And a valid contract exists for "Coopmart"
    When I submit a new advertisement with:
      | brandName | Coopmart                     |
      | image     | coopmart_banner.png          |
      | url       | https://www.coopmart.com.vn |
    Then the system should save the advertisement
    And it should be linked to the "Coopmart" contract
    And the response status should be 201

  Scenario: Prevent non-admin users from creating ads
    Given I am authenticated as a Regular Customer
    When I attempt to post a new advertisement
    Then the system should deny access
    And the response status should be 403

  Scenario: Automatically hide ads when contract expires
    Given an advertisement exists for "Samsung"
    And its contract was set to expire yesterday
    When the system checks for active ads
    Then the Samsung advertisement status should be set to "expired" (Inactive)
    And it should no longer appear on the Homepage
