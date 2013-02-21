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
                    LIMIT 100
                   "
    neo.execute_query(cypher_query,  {:username => username})["data"].collect{|n| {"source" => n[0], "target" => n[1]} }
  end

  def tagged_edges(tag = "neo4j")
    neo = Neography::Rest.new
    cypher_query = "START n=node:tags(name={tag})
                    MATCH m-[:TWEETED|TAGGED]-t-[:TAGGED]->n
                    RETURN n.name as me, coalesce(''+m.twid?,'::'+m.name) as other, count(other) as cnt
                    ORDER BY cnt DESC
                    LIMIT 100
                   "
    neo.execute_query(cypher_query,  {:tag => tag})["data"].collect{|n| {"source" => n[0], "target" => n[1]} }
  end

  def tweets(username = "neo4j")
    neo = Neography::Rest.new
    cypher_query = "START n=node:users(twid={username})
                    MATCH n-[:TWEETED]->t
                    RETURN distinct t.link,t.date, t.text
                    ORDER BY t.date desc
                    LIMIT 10
                   "
    neo.execute_query(cypher_query,  {:username => username})["data"].collect{|n| {"link" => n[0],"date" => n[1],"text" => n[2]}}
  end

  def tagged_tweets(tag = "neo4j")
    neo = Neography::Rest.new
    cypher_query = "START n=node:tags(name={tag})
                    MATCH n<-[:TAGGED]-t
                    RETURN distinct t.link,t.date, t.text
                    ORDER BY t.date desc
                    LIMIT 10
                   "
    neo.execute_query(cypher_query,  {:tag => tag})["data"].collect{|n| {"link" => n[0],"date" => n[1],"text" => n[2]}}
  end

  get "/edges/:id" do |id|
    if id=~/^::/
      tagged_edges(id[2..-1]).to_json
    else
      edges(id).to_json
    end
  end

  get "/tweets/:id" do |id|
    if id=~/^::/
      tagged_tweets(id[2..-1]).to_json
    else
      tweets(id).to_json
    end
  end

  get "/" do
    gon.edges = edges 
    haml :index
  end
    
  get "/image/:id" do |id|
puts "#{id}"

    content_type 'image/png', :layout => false
    response['Access-Control-Allow-Origin'] = "*"
    file="/img/#{id}.png"
    unless (File.exists?("public#{file}"))
      if id =~ /^::/
        make_image(id,"http://ansrv.com/png?s=#{id[2..-1]}&c=74d0f4&b=231d40&size=5");
      else
        make_image(id)
      end
    end
    redirect(file)
  end

  def pre_save_images
    cypher = "START n = node:users('twid:*') RETURN DISTINCT n.twid"
    neo.execute_query(cypher)["data"].each{ |id| make_image(id[0]) }
    cypher = "START n = node:tags('name:*') RETURN DISTINCT n.name"
    neo.execute_query(cypher)["data"].each{ |id| make_image('::'+id[0],"http://ansrv.com/png?s=#{id[0]}&c=74d0f4&b=231d40&size=5") }
  end

  def make_image(id, url="http://api.twitter.com/1/users/profile_image?screen_name=#{id}&size=bigger")
    $stderr.puts id
    file="/img/#{id}.png"
    unless File.exists?("public#{file}")
      f = File.new("public#{file}", "w+b")
      f.write HTTParty.get(url).parsed_response
      f.close
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
        self.font_family = 'Times'
        self.stroke = 'none'
        self.fill = '#74d0f4'
        self.font_weight = Magick::BoldWeight
    end
    img.write("gif:public/img/#{id}.png")
  end

end
