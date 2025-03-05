# Notes

- This is a project to give a proof of concept of a service for scraping and querying the results of the scraping

## Key features

- From the client you can request scraping task, the task itself (called ScrapingTask in the code) starts whenever possible asynchronously
- It is possible to track the status of a task at this address: `http://localhost:3000/scraping-task/{id}`
- When a task is successfully complete, another async task is carried to remove old versions of the result (called Documents in the code) to free space and keep the table as small as possible
- Indices have been added to speed up queries to Documents, but further analysis of use cases and read patterns can help improve the system, before thinking about technical solutions such as caching, table partitioning and other
