# Overview

High performance reverse proxy for New Google Sites to support custom Domain Name for New Google Sites, single instance can serve multiple domains, can be deployed as SAAS

# How to

You can change any environment variables etc from config.js, The Google Sites mapping for a given domain is picked from stored Database, For database entries can be found in config.js.

The table schema is as follows

```sh
TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `site` varchar(100) NOT NULL,
  `domain` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
)
```

id - auto increment, primary key
site - User's GoogleSite address
domain - TLD value user's custom domain

for example published address of new Google sites for user is: https://sites.google.com/view/mynewsite
The value of `site` will be mynewsite, if the domain registered is mysite.com or www.mysite.com, the domain value will be mysite.com

# Installing the Server
Clone the repo, cd into the cloned repo

```
npm install
```

```
node index.js
```

You can also optional start it as supervisor option

# DNS Changes
Deploy the server, point the A record to deployed server's IP address, Optionally you can also include a CNAME record for 'www' pointing to A record or the IP itself