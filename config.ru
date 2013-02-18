# -*- encoding: utf-8 -*-
$:.unshift File.dirname(__FILE__)

ENV['RACK_ENV'] ||= 'development'

require 'lib/neowaza'
require 'app'
require 'sidekiq/web'

map '/' do
  run App
end

map '/sidekiq' do
  run Sidekiq::Web
end