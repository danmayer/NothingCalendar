class UsersController < ApplicationController

  def index
    @users = User.order('lower(name)').all
    @sub_title = 'User list'

    respond_to do |format|
      format.html { render :layout => suggested_layout }
      format.json { render :json => @users.as_json(:request => request) }
    end
  end

  def show
    @user = User.find_by_id_or_name(params[:id])
    if @user
      @marks = {}
      if @user.marks_data
        sorted_marks = JSON.parse(@user.marks_data).sort {|mark_a,mark_b| mark_a['key'] <=> mark_b['key']}
        @marks = {:data => sorted_marks }
      end
    else
      error_message = "User not found"
      respond_to do |format|
        format.html {
          flash[:error] = error_message
          redirect_to '/'
        }
        format.json { render :json => {:errors => [error_message]} }
      end
      return
    end
    respond_to do |format|
      format.html { render :layout => suggested_layout }
      format.json { render :json => @user.as_json(:request => request) }
    end
  end

  #TODO do we like a auth and show on user controller?, perhaps move this on session controller #auth
  def auth
    if current_user
      render :json => current_user.as_json(:only => [:email, :id, :name])
    else
      Rails.logger.info 'requires auth'
      render :json => {}, status => 401
    end
  end

end
