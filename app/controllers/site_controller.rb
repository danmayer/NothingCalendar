class SiteController < ApplicationController
  def index
  end

  def auth
    Rails.logger.info "hit"
    if current_user
      render :json => {:email => current_user.email}.to_json
    else
      Rails.logger.info 'requires auth'
      render :json => {}.to_json, status => 401
    end
  end

end
