class ApplicationController < ActionController::Base
  protect_from_forgery

  after_filter :flash_preserve

  protected

  def flash_preserve
    [:notice, :error, :alert].each do |key|
      cookies[key] = flash[key] unless flash[:key].blank?
    end
  end

end
