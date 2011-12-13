class ApplicationController < ActionController::Base
  protect_from_forgery

  after_filter :flash_preserve

  protected

  def flash_preserve
    Rails.logger.info flash
    [:notice, :error, :alert].each do |key|
      cookies[key] = flash[key] unless flash[key].blank?
    end
  end

  def suggested_layout
    request.headers['X-PJAX'] ? false : true
  end

end
