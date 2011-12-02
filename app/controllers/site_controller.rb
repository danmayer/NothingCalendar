class SiteController < ApplicationController

  def index
    @sub_title = "Don't break the chain!"
  end

  def templates
    render :layout => false
  end

end
