class UsersController < ApplicationController

  def index
    @users = User.order('lower(name)').all
  end

  def show
    @user = User.find_by_id_or_name(params[:id])
    if @user
      @marks = {}
      if @user.marks_data
        sorted_marks = JSON.parse(@user.marks_data).sort {|mark_a,mark_b| mark_a['key'] <=> mark_b['key']}
        @marks = {:data => sorted_marks }
        Rails.logger.info @marks.inspect
      end
      render
    else
      flash[:error] = "User not found"
      redirect_to '/'
    end
  end

  #TODO do we like a auth and show on user controller?, perhaps move this on session controller #auth
  def auth
    if current_user
      render :json => current_user
    else
      Rails.logger.info 'requires auth'
      render :json => {}.to_json, status => 401
    end
  end

end
