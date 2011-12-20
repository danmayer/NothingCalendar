module ApiRoutes

  def self.index(request)
    site_root = "#{request.protocol}#{request.host_with_port}"
    {:routes => {
        :index => "#{site_root}/.json",
        :users => "#{site_root}/users.json",
        :me    => "#{site_root}/users/me.json"
      }
    }
  end

end
