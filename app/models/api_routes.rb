module ApiRoutes

  def self.index(request = nil)
     site_root = if request
                   "#{request.protocol}#{request.host_with_port}"
                 else
                   ''
                 end
    {:routes => {
        :index => "#{site_root}/.json",
        :users => "#{site_root}/users.json",
        :me    => "#{site_root}/users/me.json"
      }
    }
  end

end
