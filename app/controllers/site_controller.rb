class SiteController < ApplicationController

  def index
    @sub_title = "Don't break the chain!"
    if request.headers['X-PJAX']
      render :layout => false
    end
  end

  def templates
    render :layout => false
  end

end
