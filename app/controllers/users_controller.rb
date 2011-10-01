class UsersController < ApplicationController

  def show
    user = User.find_by_id(params[:id])
    if user
      @marks = {:data => (JSON.parse(user.marks_data) +[{:key => 'last_updated', :val => current_user.last_updated}]) } if user.marks_data
      render
    else
      flash[:error] = "User not found"
      redirect_to '/'
    end
  end

end
