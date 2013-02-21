$:.unshift File.dirname(__FILE__)

require 'neography'
require 'rest-client'
require 'json'
require 'lib/tweets'

=begin
  {"created_at"=>"Wed, 20 Feb 2013 13:25:23 +0000", "from_user"=>"valdesjo77", "from_user_id"=>358776150, "from_user_id_str"=>"358776150", "from_user_name"=>"Valdes Nzalli", "geo"=>nil, "id"=>304220205939310592, "id_str"=>"304220205939310592", "iso_language_code"=>"en", "metadata"=>{"result_type"=>"recent"}, "profile_image_url"=>"http://a0.twimg.com/profile_images/2922359031/c47d44760a8c30cda9fd982a6a53db55_normal.jpeg", "profile_image_url_https"=>"https://si0.twimg.com/profile_images/2922359031/c47d44760a8c30cda9fd982a6a53db55_normal.jpeg", "source"=>"&lt;a href=&quot;http://twitter.com/&quot;&gt;web&lt;/a&gt;", "text"=>"Cassandra vs MongoDB vs CouchDB vs Redis vs Riak vsHBase vs Couchbase vs \nNeo4j vs Hypertable vs ...\n http://t.co/LWkoWQiD #DB #RDBMS", "to_user"=>nil, "to_user_id"=>0, "to_user_id_str"=>"0", "to_user_name"=>nil}
=end

Neography.configure do |config|
  config.log_enabled    = true
end

# https://dev.twitter.com/docs/api/1/get/search
def load_tweets(query,lang="en",page=1,rpp=100)
  res=RestClient.get('http://search.twitter.com/search.json',{:params=> {:q=>query, :lang=>lang,:rpp=>rpp,:page=>page},:accept=>:json})
  puts res.code
  return [] unless res.code==200

  data=JSON.parse(res.to_str)

  data['results']
end

twitter = Tweets::Tweets.new
while true
  begin
    tweets=load_tweets "neo4j OR #neo4j OR @neo4j OR #waza OR @heroku OR heroku OR #herokuwaza OR waza.heroku.com"
    tweets.each do |tweet|
      puts tweet['from_user'], tweet['text'][0..30]
      break unless twitter.add_tweet tweet
    end

    sleep(60)
  rescue => e
    puts e
    sleep(120)
  end
end
