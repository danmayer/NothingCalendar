class SiteController < ApplicationController
  include ApiRoutes

  def index
    puts ApiRoutes.methods
    respond_to do |format|
      format.html { render :layout => suggested_layout }
      format.json { render :json => ApiRoutes.index(request) }
    end
  end

  def about
    @sub_title = "Don't break the chain!"
    render :layout => suggested_layout
  end

  def templates
    render :layout => false
  end

end
