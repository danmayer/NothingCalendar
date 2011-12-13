class SiteController < ApplicationController

  def index
    render :layout => suggested_layout
  end

  def about
    @sub_title = "Don't break the chain!"
    render :layout => suggested_layout
  end

  def templates
    render :layout => false
  end

end
