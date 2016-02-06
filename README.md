# Elex Voting System


## Overview and Reasoning
Many organizations make use of regular voting to assist in decision making processes. Legislative bodies vote on motions regularly, often specified by Robert’s Rules of Order, to approve actions. Clubs and other student organizations make use of voting to elect officers, and officers use voting to approve financial, executive, and other decisions for their club.

Although solutions exist for basic voting functionalities, such as surveys, polling, iClickers, et cetera, each implementation only partially fulfills the vote requirements of organizations. This is where Elex comes in. By developing a system with organizations in mind, the system will fill a long-lasting hole in organizational efficiency.

This project will prove to be very useful for student organizations, both at RPI and at other institutions, by implementing more effective, automated elections. Our implementation will ensure scalability and ensure that the means for adding new features post-development will be seamless.

## Planned Functionalities
Aside from the core functionalities of simultaneous voting, creating and administering votes, and displaying vote results, Elex will also include supplementary features to empower different organization types to conduct a wide array of vote types.

The application will store an active membership list, which will log who is authorized to vote, if present. This membership list will be presented to the organization’s leader or designated vote coordinator (the administrator) when a meeting is open, which will allow the administrator to specify who is present at the meeting. This attending designation will allow only those users to vote as part of the meeting. Any other users, depending on if they’re members of the organization or not, will be given an appropriate message to confirm their attendance or explain that they are not a voting member of the specific organization.

When initiating a vote, the administrator will be able to either select the default set of options for the vote (yes, no, and abstain) or input custom options for those voting to choose from. This could be used in a variety of situations, including the options of candidate’s names in a club’s election. The administrator will also be able to provide a time limit for voters to input their votes, and any voter who fails to vote in that time limit would automatically be counted as abstentions.
While the vote is still open, voters can change their vote if they choose to. Once the time limit runs out, all of the voters have finished voting, or when the administrator marks the vote as closed, Elex will display a pie chart displaying the distribution of the votes.

## Technical Details

Our application will implement the MEAN Stack, which consists of MongoDB as the database management service, ExpressJS as the backend routing system, AngularJS as the front-end modal-view-controller system, and NodeJS as the server runtime.

Elex will make use of Bootstrap, along with custom styles, for front-end responsiveness, mobile compatibility, and good design practices. This allows for a scalable web page that retains a uniform structure and is able to be used on different devices without compromising the look of the website.

For authentication, our application will use RPI’s Central Authentication System. Since CAS is a standard found at universities, companies, and other organizations, implementing the same system for other organizations will be painless and simple.

For additional user data, Elex will utilize the RPI Club Management System, which provides insight on organizations the user is a part of, as well as user data obtained from RPI’s central database. Although this system is very specific to RPI, Elex intends to include instructions on how to disable the CMS API for use at other institutions.

For version control and collaboration, Elex will be maintained through a GitHub repository (https://github.com/wtg/elex). This allows all developers to collaborate and contribute to Elex simultaneously; additionally, all developers can easily ensure their version is up to date. In the event of code conflicts, developers will be able to find resolutions without hassle.

For documentation, developers will use Google Docs and GitHub’s wiki functionality to keep our documentation standardized and updated. Elex will also contain a predetermined standard of in-code commenting and docstrings for better code readability.

For data visualization and historical data views, Elex will create different visualizations for our app’s collected data in forms of charts and graphs using D3.js, which is a JavaScript library used to create visuals for datasets.

Elex will utilize a custom-built representational state transfer (REST) API so other applications and users can further extend our application by making use of our data. The data provided will include vote results and voter breakdowns for public votes, which is useful for public elected offices. Votes that are not noted as public will not be publicly visible.

## Contributors
This project was created by Steve Cardozo, Sensen Chen, Justin Etzine, Samuel Fok, and Tristan Villamil as a semester project for ITWS-4500 Web Science Systems Development, taught by Professor Plotka.
