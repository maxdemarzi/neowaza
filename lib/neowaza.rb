# -*- encoding: utf-8 -*-
$:.unshift File.dirname(__FILE__)

require 'bundler'
Bundler.require(:default, (ENV["RACK_ENV"]|| 'development').to_sym)

Twitter.configure do |config|
  config.consumer_key       = ENV['CONSUMER_KEY'] || "0Wh2SIGMXlpEHt8fQBdAA"
  config.consumer_secret    = ENV['CONSUMER_SECRET'] || "3vBPTRKV1xoRFDPpExxhIlNG6MqXpxometowJR9llm4"
  config.oauth_token        = ENV['OAUTH_TOKEN'] || "19249274-F0w2HtKLngnXCeLEzlwompYjVOZrA32a0sK9RSrc0"
  config.oauth_token_secret = ENV['OAUTH_TOKEN_SECRET'] || "aufMplYbpPsBDMmYy7yrcusrj7eVTMLJcwxRgVVv7k"
end

Sidekiq.configure_server do |config|
  config.redis = { :url => ENV['REDISTOGO_URL'], :size => 10}
end

Sidekiq.configure_client do |config|
  config.redis = { :url => ENV['REDISTOGO_URL'] , :size => 10}
end

$neo_server = Neography::Rest.new

require 'jobs/search_tweets'
