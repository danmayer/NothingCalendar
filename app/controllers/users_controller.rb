class UsersController < ApplicationController

  def show
    @user = User.find_by_id(params[:id])
    @user ||= User.find_by_name(params[:id])
    if @user
      @page_title = "NothingCalendar"
      @sub_title = "Tracks occurences of some event."
      @marks = {}
      if @user.marks_data
        sorted_marks = JSON.parse(@user.marks_data).sort {|mark_a,mark_b| mark_a['key'] <=> mark_b['key']}
        @marks = {:data => (sorted_marks +[{:key => 'last_updated', :val => @user.last_updated}]) }
        Rails.logger.info @marks.inspect
      end
      render
    else
      flash[:error] = "User not found"
      redirect_to '/'
    end
  end

  #TODO do we like a auth and show on user, perhaps add this on session auth
  def auth
    if current_user
      render :json => {:email => current_user.email, :id => current_user.id, :name => current_user.name}.to_json
    else
      Rails.logger.info 'requires auth'
      render :json => {}.to_json, status => 401
    end
  end

end
