class UsersController < ApplicationController

  def show
    user = User.find_by_id(params[:id])
    if user
      @page_title = "NothingCalendar"
      @sub_title = "Tracks occurences of some event."
      if user.marks_data
        sorted_marks = JSON.parse(user.marks_data).sort {|mark_a,mark_b| mark_a['key'] <=> mark_b['key']}
        @marks = {:data => (sorted_marks +[{:key => 'last_updated', :val => user.last_updated}]) }
        Rails.logger.info @marks.inspect
      end
      render
    else
      flash[:error] = "User not found"
      redirect_to '/'
    end
  end

  #TODO move to users_controller#show with params?
  def auth
    if current_user
      render :json => {:email => current_user.email, :id => current_user.id}.to_json
    else
      Rails.logger.info 'requires auth'
      render :json => {}.to_json, status => 401
    end
  end

end
