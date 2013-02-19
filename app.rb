# -*- encoding: utf-8 -*-
require "bundler"
Bundler.setup(:default)
Bundler.require

$LOAD_PATH.unshift(Dir.getwd)

require "sinatra/reloader"

class App < Sinatra::Base
  register Gon::Sinatra

  configure :development do |config|
    register Sinatra::Reloader
    config.also_reload "lib/neowaza/**/*"
  end

  helpers do
    def partial(name, options={})
      haml("_#{name.to_s}".to_sym, options.merge(:layout => false))
    end
  end

  def nodes
    neo = Neography::Rest.new
    cypher_query =  " START node = node(*)"
    cypher_query << " RETURN ID(node), node"
    cypher_query << " LIMIT 200"
    neo.execute_query(cypher_query)["data"].collect{|n| {"id" => n[0]}.merge(n[1]["data"])}
  end  

  def edges
    neo = Neography::Rest.new
    cypher_query =  " START source = node(*)"
    cypher_query << " MATCH source -[rel]-> target"
    cypher_query << " RETURN ID(source), ID(target)"
    cypher_query << " ORDER BY ID(source), ID(target)"
    cypher_query << " LIMIT 1000"
    cypher_query = "start n=node:users(twid=\"peterneubauer\") match n-[:KNOWS]-m return ID(n), ID(m)"
    neo.execute_query(cypher_query)["data"].collect{|n| {"source" => n[0], "target" => n[1]} }
  end

  get "/" do
   # gon.nodes = nodes 
    gon.edges = edges
    haml :index
  end
  
  get "/image/:id" do 
    #content_type 'application/octet-stream'
    content_type 'image/png', :layout => false
    response['Access-Control-Allow-Origin'] = "*"
#    http://api.twitter.com/1/users/profile_image/:screen_name.format
    image = HTTParty.get("http://api.twitter.com/1/users/profile_image/maxdemarzi.png").parsed_response
    image
  end

end
