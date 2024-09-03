import { Component } from '@angular/core';

@Component({
  selector: 'web-messenger-release-history',
  templateUrl: './release-history.component.html',
  styleUrls: ['./release-history.component.scss'],
})
export class ReleaseHistoryComponent {
  public showReleaseNote = false;
  public selectedName = "";
  public selectedDate = "";
  public selectedSummary = ``;
  public newRelease = [{ name: "Release 2.3.0", date: "June 9, 2024", summary: ` <h1 class='text-primary py-3 font-bold'>New Admin Functionality</h1>
  <p class="font-bold">• Remove locked users from user report.<p>
  A new checkbox “Exclude External users” has been added to the users report for any institution.
  If the checkbox is checked, external users will not be included in the report.<br><br>
  <p class="font-bold">• “Scheduling On” option will not apply to 4th Service Team (Schedule Sync).<p>
  Scheduling On option will not be applicable for Schedule Sync.<br><br>
  <p class="font-bold">• Search user by cell phone.<p>
  Admins can now search users by the cell phone number.<br><br>
  <p class="font-bold">• Enhancement in Dropdowns.</p> The dropdowns have changed at the following places in the application.<br>
  1. Quick message institution dropdown<br>2. Reporting institution dropdown<br>3. Broadcast institution dropdown<br><br>
  <p class="font-bold">• Reporting Dropdown changes.<p>
  Thread type and Message type dropdowns are now unique while running the Message Content report.<br><br>
  <p class="font-bold">• A processing loader icon has been added in the following places.<p>
  Institution Search<br>User Search<br>View Provisioning Processor <br>Batch Jobs <br>Event Log<br>File Area<br><br>
  <p class="font-bold">• No Results Found style has been added in the application in the following locations: </p>
  User Search<br>Patient Search<br>My Batch Jobs<br>Event Log<br><br>
  <p class="font-bold">• Add Release Notes to the web portal</p>
  Release notes have been added to the portal for all our web releases. 
  These releases will be segregated as “Latest Release” and “Previous Releases.”<br><br>
  <p class="font-bold">• Change in the SMS language for Secure External Messaging.</p>
  The word Department has been removed from the SMS language for Secure External Messaging.<br><br>
  <h1 class='text-primary py-3 font-bold'>Support Tickets</h1>
  <p class="font-bold">• Users being removed while mapping new users to the Reserved Service Teams.</p> 
  Admins were unable to add new users to reserved service teams without automatically removing other users. This issue has been fixed.<br><br>
  <p class="font-bold">• While composing a new message on the web, the patient field is greyed out.</p>
  Users will now be able to add the patient’s name in the field without having patient related permissions.<br><br>
  <p class="font-bold">• Unable to Reset Search in User Event Log.</p>
  Admin were unable to reset the search while using the event log related functionality.
  This issue has been fixed.<br><br>
  <p class="font-bold">• Unable to edit the provisioning processor in file area.</p>
  Admins were unable to edit provisioning processer in file area.
  This issue has been fixed.<br><br>
  <h1 class='text-primary py-3 font-bold'>Bug Fixes</h1>
  <p class="font-bold">• Service Teams names showing even though not saving - Broadcast Message.</p>
  This issue has been fixed.<br><br>
  <p class="font-bold">• Getting 500 error while error while clicking on save - File Area > Add Processor.</p>
  This issue has been fixed.<br><br>
  <p class="font-bold">• Ability to edit the UID while creating SSO User but it was not saving.</p>
  This issue has been fixed.<br><br>
  <p class="font-bold">• Special characters should not be shown on the front end after saving the user's cellphone number.</p>
  This issue has been fixed.` }];
  public allRelease = [ { name: "Release 2.2.0", date: "May 5,2024", summary: ` <h1 class='text-primary py-3 font-bold'>Super Admin Web </h1>
  <p class="font-bold">• Scheduling integration functionality for Amion and Amtelco.</p>
  AMS Connect scheduling integration (Schedule Sync) with Amion and Amtelco, developed by Frogslayer with the following key functionalities;<br><br>
  a) Amtelco integration capabilities.<br> b) Automatic matching.<br>c) Configuration UI for email reports.<br> d) Enhancements to event log to reflect scheduling events.<br> e) Ability to disable & remove integrations.<br><br>
  <h1 class='text-primary py-3 font-bold'>Support Tickets/Bug Fixes </h1>
  <p class="font-bold">• AMSC-2769 (Web): Reserved/Restricted Service Team - Searched Mapped User.</p>
  Parent OU users/child OU users can be searched and added to the Reserved/Restricted Service Team. This issue has been fixed.` },
    { name: "Release 2.1.0", date: "April 21,2024", summary: `<h1 class='text-primary py-3 font-bold'>Web Messenger and Admin </h1>
  <p class="font-bold">• Report - Pager messages in the existing Message Content Report.</p>Going forward, pager messages sent by MyAirmail or by API will be shown correctly in their respective institution. <br><br>
  <p class="font-bold">• Pager messages will reflect correctly in the audit log.</p><br>
  <p class="font-bold">• Broadcast to a Service Team at Parent OU level.</p>The Admin can now select the Parent institution and the Service Team to send a broadcast message. If the Admin selects only the Parent institution and clicks on “preview users” all the users of Parent institution as well as all the users of Child OUs will be shown in the list of “preview users”.<br><br>
  <p class="font-bold">• Report for Service Teams under Parent OU.</p>Going forward, if there is a Service Team created at the Parent institution level that is also used by the Child OUs, the report for the parent OU will show the correct data.<br><br>
  <p class="font-bold">• Report - Changes in existing Service report.</p> Going forward, the Schedule Sync related changes will reflect in the existing service report.<br><br>
  <p class="font-bold">• Report - Changes in existing Message Content report.</p> Going forward, the Schedule Sync related changes will reflect in the existing message content report.<br><br>
  <p class="font-bold">• Intermittent delays.</p>
  The following issues have been resolved; Delay in Sending/Receiving messages, Web Socket time out issue and refresh issue.<br><br>
  <p class="font-bold">• Notification Settings fix.</p> Notification settings will now save correctly. ` }, 
    { name: "Release 2.0.0", date: "March 18,2024", summary: `• Web 2.0 with an upgraded, modern look and feel.<br><br> • Introducing Schedule Sync! Automatically Update AMS Connect Service Teams with Your QGenda, Amion, and Amtelco Schedules. On call, departmental and provider schedules are matched to Service Teams in AMS Connect with Schedule Sync.<br><br> • Users are automatically opted in and out of the corresponding Service Team according to their schedule.` },
    {
      name: "Release 1.11.0", date: "December 19,2023", summary: `<h1 class='text-primary py-3 font-bold'>New Features for iOS/Android AMS Connect Mobile App</h1><p class="font-bold">•  Addition of louder alert tones for iOS. </p> Apple recently decreased the volume of some alert tones. Due to the nature of critical  messaging, louder tones were required for end users.<br><br>
      <p class="font-bold">•  Scheduling date/time for Status Changes and Forwarding messages to another user. </p> With this new functionality, a user will be able to schedule their status as Busy or Off Duty and select coverage for a future date/time range.  <br><br>
      <p class="font-bold">•  A new field as Department while sending a Secure External Message. </p> While composing a new Secure External Message, users will have the option to enter a department name so the recipient can see which department the message is from.  <br><br>
      <p class="font-bold">•  Add search functionality in messages to search for specific person or keyword. </p>With this new feature, a search bar will be added for users to search existing messages by username, subject, or specific keywords within the message content. <br><br>
      <p class="font-bold">•  Add Cell phone number field in User Profile.  </p>A new field called Cell phone number will be added in the user profile. Users will have the ability  <br>to add or edit their cell phone number. <br><br>
      <p class="font-bold">•  Existing users with no cell phone number to be prompted to provide one.  </p>For users with no cell phone number on file, a popup will be presented. For security authentication and password recovery, users will have the ability to directly enter their cell phone number. **this does not apply to existing SSO customers. <br><br>
      <h1 class='text-primary py-3 font-bold'>New Admin Features for AMS Connect</h1>
      <p class="font-bold">•  Mapped Services Report. </p>With this enhancement, Admins will be able to run a report that shows all mapped users for reserved and restricted service teams.<br><br><h1 class='text-primary py-3 font-bold'>Bug fixes and Security enhancements</h1>` },
    {
      name: "Release 1.10.0", date: "November 05,2023", summary: `<h1 class='text-primary py-3 font-bold'>Super Admin/Admin features for Web Application</h1><p class="font-bold">•  Ability to disable copy and paste feature at the institution level. </p>With the copy and paste feature disabled, users in the institution will not be able to copy text within AMS Connect to paste elsewhere. <br><br>
      <p class="font-bold">•  Ability to disable screenshots in AMS Connect at the institution level. </p>With the screenshot feature disabled, users in the institution will not be able to take screenshots on their mobile device within the AMS Connect application. <br><br>
      <p class="font-bold">•  Extend SEM time beyond 24 hours at the institution level. </p>This enhancement allows the institution to extend the time limit for a secure external message link from 24 hours to up to 72 hours. <br><br>
      <p class="font-bold">•  Application version number on web. </p>The application version number will now be displayed in the web platform under Settings > AMS Connect > Application Version.<br><br>
      <p class="font-bold">•  New field for location in PCM template. </p>With this enhancement a new field for location has been added to the Patient Centric Messaging template when adding a new patient under the Add Patient option.
      <h1 class='text-primary py-3 font-bold'>Features for iOS/Android Applications</h1>
 <p class="font-bold">• Pop-up notification when last user opts out of Service Team. </p>
With this enhancement, when the last user is opting out of a Service Team, a notification will pop up to notify them that they are the last user in the Service Team and if they opt out, the Service Team will be left unattended. At that time, the user will have the option to either continue to opt out or to remain in the Service Team. <br><br>
<p class="font-bold">• Add Service Team name to message inbox quick view. </p>
When a peer-to-peer message is sent to a Service Team, the name of the Service Team will appear in the inbox quick view. <br><br>
<p class="font-bold">• Invite a colleague.</p>
With this enhancement, users in an institution can invite a colleague to join AMS Connect by navigating to the Support section in the application and submitting the colleague’s information 
in the fields provided. (New users will have to be approved by the institution admin before being provisioned).<br><br>
<p class="font-bold">• Push notification sent out to existing users when Silent/DND override is enabled at the 
institution level.</p>
With this enhancement, if Silent/DND override is enabled at the institution level, a pop-up notification will be sent to all existing users prompting them to allow or decline the feature in their device settings.<br><br> <h1 class='text-primary py-3 font-bold'>Bug fixes and Security enhancements</h1>` },
    {
      name: "Release 1.9.0 ", date: "August 14,2023", summary: `<h1 class='text-primary py-3 font-bold'>Admin Features for web Applications</h1> <p class="font-bold">• Reporting enhancement to capture Service Team name and type.</p>Message Content Report will now capture the Service Team name, Service Type and associated pager number when sending a Broadcast Message.<br><br>
    <h1 class='text-primary py-3 font-bold'>Features enhancements for web and mobile Applications (Android & iOS)</h1>
    <p class="font-bold">•  Ability to add internal users to a Secure External Message.</p> The initiator of a Secure External Message now has the ability to add additional, internal users into an external conversation thread. <br><br>
    <p class="font-bold">•  Notification to users when added/removed from Service Teams.</p>If the Institution has ‘Service Team Notifications’ enabled, users who are added or removed from a Service Team by an admin will receive notification in the app. <br><br>
    <p class="font-bold">•  One-touch conference bridge dialing. </p>Properly formatted conference bridge numbers can now be dialed from within AMS Connect with long press one-touch dialing. <br><br>
    <p class="font-bold">•  Verification of Cell Phone number. </p> Cell phone numbers will be verified every six months or upon changing the phone number.<h1 class='text-primary py-3 font-bold'>Bug fixes and Security enhancements</h1>` },
    {
      name: "Release 1.8.0", date: "April 16, 2023", summary: `<h1 class='text-primary py-3 font-bold'>Features for iOS/Android Applications</h1>
    <p class="font-bold">• Ability to search by Specialty or Title when composing a message.</p>When composing a new message, we now offer the ability to search for users based on the Title or Specialty that is listed in their account ID.<br><br>
    <p class="font-bold">• Phone Numbers or URL as hyperlink enhancement in Secure External Messages.</p>A 10-digit phone number or URL sent in a Secure External Message will become a hyperlink where user can click on and make a phone call or get redirected to a website.<br><br>
    <p class="font-bold">• Improvement of 'No Internet Connection' display in mobile applications.</p>To improve user experience, when a device has no Wi-Fi or Broadband connectivity, a ‘no internet connection’ banner will display. Once the device connects to Wi-Fi or Broadband, the banner will disappear. <br><br>
    <p class="font-bold">• SMS for Reset/Forgot Password along with existing Email.</p>Today when user clicks forgot password, an email is triggered containing a password reset link. We now have the ability to send the password reset link via SMS as well (providing user has  mobile# as part of their account ID). <br><br>
    <p class="font-bold">• Cell Phone Number Verification by entering OTP.</p>For enhanced security, when a cell phone number is provided as part of the user’s information, that number must be verified by entering a One Time Password (OTP) during the verification process.<br>
   <h1 class='text-primary py-3 font-bold'>Admin Features for web Applications</h1>
   <p class="font-bold">• Capture LOCK date on Users Report.</p> When a user is locked, the lock date and time will reflect in a new column called ‘Time_Locked’. This time is in UTC time zone.<br><br>
   <p class="font-bold">• Remove Secure External Messages from Users Report.</p>Secure External Messages will no longer appear in Users Report. The messages will now be found under Message Content report > Thread type - External Messages.<br> <br>
   <p class="font-bold">• Cell Phone Number field in the User Report. </p>A new field has been added in the Users Report to display the user’s cell phone number. <br><br>
   <p class="font-bold">• Reserved or Restricted Service set at Institution level to be available for users in different OUs. </p> We now have the ability to map users from child Organizational Units to a Reserved or Restricted Service Team set at the Parent institution. <br> <br>
   <p class="font-bold">• Cell phone number use for communication and back-channel alerts. </p>This feature allows the ability to enable communication via SMS to cell phone number (where provided). Among other things, this communication includes activation and/or password reset links and notices of unread messages <br><br><h1 class='text-primary py-3 font-bold'>Security Enhancements</h1> <h1 class='text-primary py-3 font-bold'>Bug fixes</h1>` },
    {
      name: "Release 1.7.0", date: "February 26, 2023", summary: `<h1 class='text-primary py-3 font-bold'>Super Admin/Admin features for Web Application</h1><p class="font-bold">• Increase maximum number of users in a Service Team.</p> The current limit for Service Team participants is 100. With this release, this limit has been raised to 250. An Admin can add up to 250 users into a Service Team. <br><br>
      <p class="font-bold">• Increase maximum number of users in a Messaging Group.</p> The current limit for Messaging Group participants is 100. With this release, this limit has been raised to 250. An Admin can add up to 250 users into a Messaging Group.<br><br>
      <p class="font-bold">• Addition of a loader icon while sending messages with larger Service Teams and Messaging Groups.</p> While sending messages to larger Service Team or Messaging Groups, a loader icon will be shown to the user. The duration of the loader icon will be determined by the size of the Team or Group. Each user must be validated before the message is sent. While this process is extremely fast, the loader icon may appear for a few seconds indicating to the user that the message is in process.<br><br>
      <p class="font-bold">• Service Team deletion.</p> When a Service Team is deleted by an Admin, all subsequent schedules on that Service Team will also be deleted.<br><br>
      <p class="font-bold">• Display the “Year” in a Restricted Service Team schedule view.</p> In the Restricted Service Team schedule view, the Year portion of the date will now be visible to the end user. <br><br>
      <p class="font-bold">• Ability to enable Secure External Messaging at user level.</p>Previously this feature was institution wide. With this new functionality, a new permission called “‘External Messages” has been added under the User Details. When this permission is enabled, a user can access the Secure External Messaging functionality.<br>Note: The Secure External Messaging feature must first be enabled at the Institution level.<br>
      <h1 class='text-primary py-3 font-bold'>Features enhancement for Mobile Applications (iOS & Android) </h1>
<p class="font-bold">• Addition of a loader icon while sending messages with larger Service Teams and Messaging 
Groups.</p> While sending messages to larger Service Team or Messaging Groups, a loader icon will 
be shown to the user. The duration of the loader icon will be determined by the size of the Team or Group. Each user must be validated before the message is sent. While this process is 
extremely fast, the loader icon may appear for a few seconds indicating to the user that the message is in process.<br><br>
<p class="font-bold">• Ability to mask/hide a user’s cell phone number when calling from the AMS Connect app.</p>
This new functionality gives the ability to mask/hide user cell phone number when calling a number from the AMS Connect application. Users will have two options when calling, either Hide caller ID or Show caller ID.<br><br>
<p class="font-bold">•Feedback - Mobile Application.</p>
With this new feature, mobile application users will have the ability to send feedback on the performance and features of the mobile application. A pop up will display two options:
 a) They can rate the app in the respective store i.e., Play Store and App Store
 b) They can send feedback to the support@amsconnectapp.com.<br><br>
<p class="font-bold">• Support Email - Additional Info.</p>
This new support enhancement will automatically populate the user’s email address that they used for provisioning and their pager number will be included. Note: If no pager number is associated than NA will be automatically populated. <br><br>
<p class="font-bold">• Display the “Year” in a Restricted Service Team schedule view.</p>
In the Restricted Service Team schedule view, the Year portion of the date will now be visible to the end user.<br><br><h1 class='text-primary py-3 font-bold'>Various Security Enhancements</h1>` },
    {
      name: "Release 1.6.0", date: "January 22, 2023", summary: `<h1 class='text-primary py-3 font-bold'>Super Admin/Admin features for Web Application </h1><p class="font-bold">• Optional addition of the cell phone number in the user creation (web & external API both) and add/update CSV file.<br><br> • Change default email verbiage for the "Activation Email (with reset link)" template.<br><br> • Addition of verifying the user email address via email and SMS text message.<br><br> • After account creation by Super admin/Admin, welcome email will be sent to both the email address and cell phone number as SMS text message with the activation links.<br><br> • Automated reminder welcome email and text message on every Tuesday.<p> 
    <h1 class='text-primary py-3 font-bold'>Features enhancement for Mobile Applications (iOS & Android) </h1>
    <p class="font-bold">• Enhancement and simplification of the initial log in process. <br>
    o Addition of verifying the user email address via email and SMS text message.<br>
    o Create Password Page <br></p>After the user clicks the activation link, the user will be redirected to the create password page under the account setup activity from the mobile application.<br><br><h1 class='text-primary py-3 font-bold'>Various Security Enhancements</h1>` },
    { name: "Release 1.4.3", date: "November 26, 2022", summary: `<h1 class='text-primary py-3 font-bold'>Super Admin features for Web Application </h1>
    <p class="font-bold">• Institution creation API – AMS internal use only:</p>
    Super admin will have the option to create new institution with the newly created external API.
    Institution created will have the default values as follows; Message retention set to 3 days, 
    Pager Integration, Service Teams, Camera roll disabled, Camera use disabled, Other 
    Attachments disabled. Reporting tags will be AMS, Basic only API.` },
    { name: "Release 1.3.2", date: "January 16, 2021", summary: "<h1 class='text-primary py-3 font-bold'>Security Enhancements</h1>" },
    {
      name: "Release 1.3.0", date: "September 10, 2021", summary: `<h1 class='text-primary py-3 font-bold'> Feature Enhancements </h1> <p class="font-bold"> • Enhancement to the Service Teams Feature.</p> Users will now be able to schedule services for the first time from their mobile application. Previously, users were required to schedule services for the first time from the web.<br><br>
      <p class="font-bold">• User interface improvement.</p> Basic version users will not be able to view the functionality of the Prime version. The following features are greyed out for the Basic version:<br>o Manage Accounts<br>o Manage Messaging Groups<br><br>
      <p class="font-bold">• Enhancement to the Secure External Messaging Feature(Photo feature).</p> The photo feature has been added to enable users to take a photo from within the secure application and send it along with text. One photo is allowed per message. For security purposes, photos cannot be added from the sender's gallery. <br><br>
      <p class="font-bold">• Enhancement to the Secure External Messaging Feature.</p> For clarity, when composing a new Secure External Message, the To: field has been changed to Mobile Number: and the Name: field has been changed to Recipient Name:<br><br>
      <p class="font-bold">• User interface improvement(Urgent mode icon).</p> The urgent mode icon (!) has been moved to a more convenient location to prevent accidentally marking a message as urgent while composing the message. <br><br>
      <p class="font-bold">• User interface improvement(Pager phone number).</p> Pager phone number has been added to the User Profile along with Specialty and Title.<br><br>
      <h1 class='text-primary py-3 font-bold'>Administrator Enhancements</h1>
      <p class="font-bold"> • Reporting enhancement.</p> A new Service Teams report shows a list of users signed into a specific Service Team during a selected date/time period. *Users must be scheduled into the Service Team to appear on the report. <br><br>
      <p class="font-bold">• Administrators can now send a Broadcast Message to a Service Team.</p> All users who are Opted-Into the Service Team at that time will receive the Broadcast Message. <br><br>
      <p class="font-bold"> • Administrators can now change a user's status and select coverage on their behalf.</p> Administrators can select from <br>o Available <br> o Busy <br> o Off Duty <br><br>
      <p class="font-bold"> • Enhancement to the "View Institution" information.</p> Administrators can now view the pager number associated with a Service Team along with the Service Team name.
      <h1 class='text-primary py-3 font-bold'>Bug Fixes & Security Updates </h1>
      • iOS - The user interface background color of the application will now be white consistently. <br><br> • Android - Users can now select multiple files while composing a new message.<br><br>• Security updates as required` },
    {
      name: "Release 1.2.0", date: "June 13, 2021", summary: `<h1 class='text-primary py-3 font-bold'> Feature Enhancements </h1><p class="font-bold"> • Users will now be notified when an upgraded version of the app is available in the Google Play/Apple store via notifications on their device.</p>Users can either click"Update Now" which will update the app to the new version OR click "Remind Me Leater" which will suppress the reminder for 7 days. <br><br>
      <p class="font-bold"> • Naming convention updates:  <br></p>o Service > Service Team <br>o Services > Service Teams <br> o Group > Messaging Group<br> o Groups > Messaging Groups <br><br>
      <p class="font-bold"> • Introducing new Service Teams categories.</p> Android/iOS users can view types of services they are mapped to by their administrator o General Services: Anyone can view General Services and opt-in/opt-out at any time o Reserved services: Only certain users can view and opt-in/opt-out <br>o Restricted services: Only certain users can view. Users cannot make any changes. <br><br><p class="font-bold">Restricted Services are controlled by the administrator. <br><br></p>
      • To give first time users more time to login, the magic link activation email will extend from a 7-dayexpiration to a 30-day expiration.  <br><br>
      • The volume for DND/silent override for critical messages has been reduced. <br><br>
      <h1 class='text-primary py-3 font-bold'>Administrator Enhancements</h1>
      <p class="font-bold">• Administrators can now download and view a report on users in their institution who have allowed DND/Silent Override permissions. <br><br></p>
      <p class="font-bold">• Labels have been updated on the "Select Messages Types" for DND/silent override to be more specific.<br></p>o Peer to Peer > Urgent Peer to Peer <br> o Broadcast Messages > Urgent Broadcast Messages <br><br>
      <p class="font-bold">• Introducing new Service Teams categories.</p> When new Service Teams are created, the administrator will determine the following categories. <br>o General Services: Anyone can view General Services and opt-in/opt-out at any time <br> o Reserved services: Only certain users determined by the administrator can view Reserved Services and opt-in/opt-out at any time <br> o Restricted services: Restricted Services are controlled by the administrator. Only certain users can view. Users cannot make any changes. <br><br>
      <h1 class='text-primary py-3 font-bold'>Bug Fixes</h1>
      <p class="font-bold">• Dark mode issuesin iOS have been fixed for all screens.</p> iOS users will be able to experience Dark mode properly.<br><br>
      <p class="font-bold">• Banner override notificationsissue has been fixed.</p> Android users will now experience separate banner notifications for each new message. <br><br>
      <p class="font-bold">• Manage multiple accounts on Android issue has been fixed.</p> Android users can now add multiple accounts.<br><br>
      <p class="font-bold">• Repeated encounters with the DND/silent override issue on Android have been fixed.</p> Users will now get an "Allow Do not disturb acces" window the first time they login after an app update. <br><br>
      <p class="font-bold">• After allowing do not disturb access, some Android users would tap the back button twice andrather than going back to the Home screen, it forced the user out of the app.</p> This issue has been fixed After Allowing"Do not disturb" acces,tapping the back button twice will navigate the user to the Home screen.<br><br>
      <p class="font-bold"> • Certain Android device types have experienced critical messages overriding the "Do not disturb" permission settings even though the user has not enabled the permission.</p> This issue has been fixed now all Android users' device will adhere to "Do not disturb" permission settings. <br><br>
      <p class="font-bold">• A group id issue was causing abnormal behavior in the "Do not disturb" override feature on some Android devices.</p> This issue  hase been fixed. Once enabled,users in a "Child OU" will experience the "Do not disturb" override feature properly.<br><br> *New Service Teams categories apply to newly created Service Teams only. Existing Service Teams that 
      want to recategorize will need to create new Service Teams, move users over and then delete the old ones. 
      In a future release we will add recategorize Service Teams to streamline this process.` },
    {
      name: "Release 1.1.0", date: "March 13, 2021", summary: `<h1 class='text-primary py-3 font-bold'> Feature Enhancements </h1>
      <p class="font-bold"> • Notifications will Override "Silent" and "DND" modes when Critical Alerts are "Allowed" by the end user - iOS and Android (please see separate training document for further detail).</p><br><p class="font-bold"> • Users can attach and send up to 5 files at a time.</p><h1 class='text-primary py-3 font-bold'>Reporting Enhancements</h1> <p class="font-bold"> • Ability to switch the time zone from UTC to CST in audit user messages  report.</p> <h1 class='text-primary py-3 font-bold'>Bug Fixes</h1>
      <p class="font-bold"> • Quick Message edit list will now display quick messages numbered 1,2 & 3 on the web application.<br></p>
      <p class="font-bold"> • The application will automatically add in user details when sending an email to support from within the application - Android.<br></p> <p class="font-bold"> • Restrict file sizes across all platforms to 28 MB.<br></p> <p class="font-bold"> •  Removal of hardcoded Cureatr references from source code - Android<br> Change the alert notification name from Cureatr to AMSConnect - Android. <br></p>
      <p class="font-bold"> • Disabling sound notifications will not disable visual alerts iOS and Android.<br></p> <h1 class='text-primary py-3 font-bold'>Security Enhancements</h1> <p class="font-bold"> • Restrict uploading of executable files through API<br></p><p class="font-bold"> •  Restrict sending of executables filed through the application.<br></p><p class="font-bold"> •  Integrate ProGuard into the application - Android. <br></p>` },];


  public openReleaseNoteModel(releaseName: string, release?: string): void {
    this.showReleaseNote = true;
    if (release === 'new-release') {
      this.newRelease.filter(res => {
        this.selectedName = res.name;
        this.selectedDate = res.date;
        this.selectedSummary = res.summary;
      })
    } else {
      this.allRelease.filter(res => {
        if (releaseName === res.name) {
          this.selectedName = res.name;
          this.selectedDate = res.date;
          this.selectedSummary = res.summary
        }
      })
    }
  }

  public showReleaseNoteEvent(resData: boolean): void {
    this.showReleaseNote = resData;
  }
}
