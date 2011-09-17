class MarksController < ApplicationController
  protect_from_forgery :except => :sync

  def sync
    if current_user
      force_update = false
      Rails.logger.info 'logged in'
     
      stored_data = JSON.parse(params['data'])   
      last_updated = stored_data.detect{|item| item['key']=='last_updated' }
      stored_data.delete(last_updated);
      last_updated = last_updated && last_updated['val']
      marks_data = stored_data;
      
      #Rails.logger.info ("compare: "+current_user.last_updated.to_s+" "+Time.parse(last_updated).to_s)
      #Rails.logger.info ("compare: #{current_user.last_updated - Time.parse(last_updated)}")
      #Rails.logger.info current_user.last_updated > Time.parse(last_updated)
      if last_updated==nil
        Rails.logger.info 'no user data yet, push force update'
        force_update = true
      elsif(current_user.last_updated.nil? || current_user.last_updated < Time.parse(last_updated))
        Rails.logger.info 'updated data'
        current_user.update_attributes!(:last_updated => last_updated,
                                     :marks_data => marks_data.to_json)
      elsif(!current_user.last_updated.nil? && current_user.last_updated > Time.parse(last_updated) && current_user.last_updated - Time.parse(last_updated) > 1.0)
        #converting time back and forth to ruby DB micro seconds get off
        Rails.logger.info 'push force update'
        force_update = true
      end

      remote_store = { :force_update => force_update,
        :data => JSON.parse(current_user.marks_data)+[{:key => 'last_updated', :val => current_user.last_updated}]
      }
      render :json => remote_store.to_json
    else
      Rails.logger.info 'requires auth'
      render :json => "must be logged in to sync", status => 401
    end
      

  end

end
