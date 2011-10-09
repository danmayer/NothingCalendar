class UsersController < ApplicationController

  def show
    user = User.find_by_id(params[:id])
    if user
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

end
