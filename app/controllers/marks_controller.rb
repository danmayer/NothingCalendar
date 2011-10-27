class MarksController < ApplicationController
  protect_from_forgery :except => :sync

  def sync
    if current_user
      force_update = false
      choose_update = false
     
      stored_data = JSON.parse(params['data'])   
      last_updated = stored_data.detect{|item| item['key']=='last_updated' }
      stored_data.delete(last_updated);
      last_updated = last_updated && last_updated['val']
      marks_data = stored_data;
      
      Rails.logger.info params['first_sync']
      Rails.logger.info "*"*40

      if last_updated==nil
        Rails.logger.info 'no user data yet, push force update'
        force_update = true
      elsif(current_user.last_updated.nil? || current_user.last_updated < Time.parse(last_updated))
        Rails.logger.info 'user sending updated data'
        if(params['first_sync']=='true')
          Rails.logger.info 'first sync with new data, verify with user'
          choose_update = true
        else
          Rails.logger.info 'accept updated data'
          current_user.update_attributes!(:last_updated => last_updated,
                                          :marks_data => marks_data.to_json)
        end
      elsif(!current_user.last_updated.nil? && current_user.last_updated > Time.parse(last_updated) && current_user.last_updated - Time.parse(last_updated) > 1.0)
        # converting time back & forth to ruby DB time, the micro seconds get off
        # make sure the time is greater than 1.0 second diff
        Rails.logger.info 'push force_update, signaling client to update its data'
        force_update = true
      end

      remote_data = if current_user.marks_data
                      JSON.parse(current_user.marks_data) + [{:key => 'last_updated', :val => current_user.last_updated}]
                    else
                      nil
                    end
      remote_store = { :choose_update => choose_update,
                       :force_update => force_update,
                       :data => remote_data }
      render :json => remote_store.to_json
    else
      render :json => "must be logged in to sync", status => 401
    end
      
  end

end
