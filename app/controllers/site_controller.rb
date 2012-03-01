class SiteController < ApplicationController
  include ApiRoutes

  def index
    @page_title = "NothingCalendar - daily progress"
    respond_to do |format|
      format.html { render :layout => suggested_layout }
      format.json { render :json => ApiRoutes.index(request) }
    end
  end

  def about
    @page_title = "NothingCalendar - daily progress"
    @sub_title = "Don't break the chain!"
    render :layout => suggested_layout
  end

  def templates
    render :layout => false
  end

  def test
    @page_title = "NothingCalendar - daily progress"
    render :layout => suggested_layout
  end

end
