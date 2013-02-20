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
  
  def edges(username = "neo4j")
    neo = Neography::Rest.new
    cypher_query = "START n=node:users(twid={username}) 
                    MATCH n-[:TWEETED]->t-[:MENTIONS|TAGGED]->m 
                    RETURN n.twid as me, coalesce(''+m.twid?,'::'+m.name) as other, count(other) as cnt 
                    ORDER BY cnt DESC 
                    LIMIT 3 
                   "
    neo.execute_query(cypher_query,  {:username => username})["data"].collect{|n| {"source" => n[0], "target" => n[1]} }
  end

  get "/" do
#    gon.nodes = nodes 
    gon.edges = edges #(edges.sample(3) << {"source"=>"neo4j", "target" => "::infinitegraph"})
    haml :index
  end
    
  get "/image/:id" do |id|
puts "#{id}"
    #content_type 'application/octet-stream'
    content_type 'image/png', :layout => false
    response['Access-Control-Allow-Origin'] = "*"
    file="/img/#{id}.png"
    unless (File.exists?("public#{file}"))
      if id =~ /^::/
        make_tags(id)
      else
        get_images([id])
      end
    end
    redirect(file)
  end

  def pre_save_images
    cypher = "START n = node(*) 
              WHERE has(n.twid) 
              RETURN DISTINCT n.twid"
    ids = neo.execute_query(cypher)["data"]
    get_images(ids)
  end

  def get_images(ids)
    ids.each do |id|
      file="/img/#{id[0]}.png"
      unless (File.exists?("public#{file}"))
        f = File.new("public#{file}", "w+b")
        f.write HTTParty.get("http://api.twitter.com/1/users/profile_image?screen_name=#{id[0]}&size=bigger").parsed_response
        f.close
      end
    end
  end

  def make_tags(id="waza")
    img = Magick::Image.new(256, 256) do
      self.background_color = '#231d40' #'none'
    end
    text = Magick::Draw.new
    text.annotate(img, 0, 0, 2, 80, "#" + id[2..-1]) do
        self.gravity = Magick::SouthGravity
        self.pointsize = 70 - (2 * id.size)
#        self.font_family = 'Helvetica'
        self.stroke = 'none'
        self.fill = '#74d0f4'
        self.font_weight = Magick::BoldWeight
    end
    img.write("gif:public/img/#{id}.png")
  end

end
