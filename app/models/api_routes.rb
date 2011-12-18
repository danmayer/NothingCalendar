module ApiRoutes

  def self.index(request)
    {:routes => {
        :index => "#{request.protocol}#{request.host_with_port}/.json",
        :users => "#{request.protocol}#{request.host_with_port}/users.json"
      }
    }
  end

end
