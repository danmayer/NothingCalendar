class SiteController < ApplicationController
  def index
  end

  #TODO move to users_controller#show
  def auth
    if current_user
      render :json => {:email => current_user.email, :id => current_user.id}.to_json
    else
      Rails.logger.info 'requires auth'
      render :json => {}.to_json, status => 401
    end
  end

end
