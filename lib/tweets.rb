require 'rubygems'
require 'neography'
require 'uri'
require 'json'
require 'rest-client'

module Tweets


  class Tweets
    include Neography

    TWEETS_INDEX = "tweets"
    CATEGORY_INDEX = "category"
    TAG_INDEX = "tags"
    USER_INDEX = "users"
    LINK_INDEX = "links"

    def initialize
      @neo = Rest.new
      @root = Node.load(0)
      [TWEETS_INDEX,CATEGORY_INDEX,TAG_INDEX,USER_INDEX,LINK_INDEX].each do |index|
        @neo.create_node_index(index)
      end
      @tags = unique(CATEGORY_INDEX,:category,'TAGS',{:category=>'TAGS'})
      @root.outgoing(:TAGS) << @tags unless @root.rel?(:outgoing, :TAGS)
      @users = unique(CATEGORY_INDEX,:category,'USERS',{:category=>'USERS'})
      @root.outgoing(:USERS) << @users unless @root.rel?(:outgoing, :USERS)
    end


=begin
  {"created_at"=>"Wed, 20 Feb 2013 13:25:23 +0000", "from_user"=>"valdesjo77", "from_user_id"=>358776150, "from_user_id_str"=>"358776150", "from_user_name"=>"Valdes Nzalli", "geo"=>nil, "id"=>304220205939310592, "id_str"=>"304220205939310592", "iso_language_code"=>"en", "metadata"=>{"result_type"=>"recent"}, "profile_image_url"=>"http://a0.twimg.com/profile_images/2922359031/c47d44760a8c30cda9fd982a6a53db55_normal.jpeg", "profile_image_url_https"=>"https://si0.twimg.com/profile_images/2922359031/c47d44760a8c30cda9fd982a6a53db55_normal.jpeg", "source"=>"&lt;a href=&quot;http://twitter.com/&quot;&gt;web&lt;/a&gt;", "text"=>"Cassandra vs MongoDB vs CouchDB vs Redis vs Riak vsHBase vs Couchbase vs \nNeo4j vs Hypertable vs ...\n http://t.co/LWkoWQiD #DB #RDBMS", "to_user"=>nil, "to_user_id"=>0, "to_user_id_str"=>"0", "to_user_name"=>nil}
=end

    def unique(index,key,value,props)
      res=@neo.create_unique_node(index,key,value,props)
      Node.load(res);
    end

    def find(index,key,value)
      res=@neo.find_node_index(index,key,value)
      return Node.load(res) if res
      nil
    end

    def add_tweet(item)
      id = item["id_str"]
      twid = item["from_user"].downcase
      text = item["text"]
      puts "Processing @#{twid}: \"#{text}\""
      if find(TWEETS_INDEX,:id, id)
        puts "Duplicate"
        return false
      end
      tweet = create_tweet(id, item, text)

      user = obtain_user(twid)
      user.outgoing(:TWEETED) << tweet

      text.gsub(/(@\w+|https?\S+|#\w+)/).each do |token|
        handle_mention(token, tweet, twid, user) || handle_link(token, tweet) || handle_tag(token, tweet, user)
      end
      true
    end

    def handle_tag(token, tweet, user)
      return false unless token =~ /#.+/
      token = token[1..-1].downcase
      tag = find(TAG_INDEX, :name, token)
      unless tag
        tag = unique(TAG_INDEX,:name,token,{:name=>token})
        @tags.outgoing(:TAGS) << tag
      end
      tweet.outgoing(:TAGGED) << tag
      user.outgoing(:USED) << tag if user.rels(:USED).outgoing.to_other(tag).empty?
      true
    end

    def handle_link(token, tweet)
      return false unless token =~ /https?:.+/
      link = unique(LINK_INDEX,:url,token,{:url=>token})
      tweet.outgoing(:LINKS) << link
      true
    end

    def handle_mention(token, tweet, twid, user)
      return false unless token =~ /^@.+/
      token = token[1..-1].downcase
      other = find(USER_INDEX, :twid, token)
      unless other
        other = unique(USER_INDEX,:twid,token,{:twid=>token})
      end
      user.outgoing(:KNOWS) << other if !(twid.eql?(token)) && user.rels(:KNOWS).outgoing.to_other(other).empty?
      tweet.outgoing(:MENTIONS) << other
      true
    end

    def create_tweet(id, item, text)
      short = text.gsub(/(@\w+|https?\S+|#\w+)/,"")[0..30]
      time = Time.parse(item["created_at"]).to_i
      user_link = "http://twitter.com/#{item["from_user"]}/statuses/#{id}"
      unique(TWEETS_INDEX,:id,id, {:id => id, :date => time, :text => text, :short => short, :link => user_link})
    end

    def obtain_user(twid)
      # start user=node:node_auto_index(twid={twid}) return user
      #
      user = find(USER_INDEX,:twid,twid)
      return user if user
      user = unique(USER_INDEX,:twid,twid,{:twid=>twid})
      @users.outgoing(:USER) << user if @users.rels(:USER).outgoing.to_other(user).empty?
      user
    end

    def user(id)
      find(USER_INDEX,:twid, id)
    end

    def tag(id)
      find(TAG_INDEX,:name, id)
    end

    def users
      @users.outgoing(:USER)
    end

    def tags
      @tags.outgoing(:TAGS)
    end
  end
end