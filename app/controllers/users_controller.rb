class UsersController < ApplicationController

  def index
    @users = User.order('lower(name)').all
    @sub_title = 'User list'

    respond_to do |format|
      format.html { render :layout => suggested_layout }
      format.json { render :json => {:users => @users.as_json(:request => request, :skip_root => true)} }
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
        format.json { render :json => {:errors => [error_message]}, status => 404 }
      end
      return
    end
    respond_to do |format|
      format.html {
        @page_title = "#{@user.name}'s NothingCalendar"
        @share_description = "#{@user.name}'s NothingCalendar progress"
        render :layout => suggested_layout
      }
      format.json { render :json => @user.as_json(:request => request).merge(:marks => @marks[:data]) }
    end
  end

  def me
    if current_user
      render :json => current_user.as_json(:request => request, :only => [:email, :id, :name])
    else
      render :json => { :errors => ['authorization required']}, status => 401
    end
  end

end
