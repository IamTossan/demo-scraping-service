# Notes

- This is a project to give a proof of concept of a service for scraping and querying the results of the scraping

## Key features

- From the client you can request scraping task, the task itself (called ScrapingTask in the code) starts whenever possible asynchronously
- It is possible to track the status of a task at this address: `http://localhost:3000/scraping-task/{id}`

## Some Analysis

Potentially the Document table is expected to hold a lot of rows, so here's some remarks about this:
  - When a task is successfully complete, another async task is carried to remove old versions of the result (called Documents in the code) to free space and keep the table as small as possible
  - Indices have been added to speed up queries to Documents
  - Before thinking about technical solutions such as caching, table partitioning and so on, deeper analysis of use cases and read patterns can help finding optimizations that matter, for example:
    - If users often read the most recent articles, or the ones he/she hasn't checked yet, we can cache the most recent documents (redis, memcache, ...), to avoid hitting too much the DB with thesame queries
    - If each user reads articles of one of few kinds, we can consider sharding to split the load between multiple instances, or maybe split between multiple tables, since the amount of rows directly impacts the indexing, getting data from memory and so on
    
