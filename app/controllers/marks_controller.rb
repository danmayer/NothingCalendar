class MarksController < ApplicationController
  protect_from_forgery :except => :sync

  def sync
    if current_user
      force_update = false
      choose_update = false
      user_marks = Mark.from_params(params['data'])

      # converting time back & forth to ruby DB time, the micro seconds get off
      # make sure the time is greater than 1.0 second diff
      if user_marks.last_updated==nil
        Rails.logger.info 'no user data yet, push force update'
        force_update = true
      elsif Mark.user_sending_updated_data?(current_user, user_marks.last_updated)
        if(params['first_sync']=='true')
          Rails.logger.info 'first sync with new data, verify with user'
          choose_update = true
        else
          Rails.logger.info 'accept updated data'
          current_user.update_attributes!(user_marks.as_hash)
        end
      elsif Mark.user_sending_outdated_data?(current_user, user_marks.last_updated)
        force_update = true
      end

      remote_data = if current_user.marks_data
                      JSON.parse(current_user.marks_data) rescue nil
                    else
                      nil
                    end
      remote_store = { :choose_update => choose_update,
                       :force_update => force_update,
                       :data => remote_data }
      render :json => remote_store
    else
      render :json => "must be logged in to sync", status => 401
    end
  end

end
