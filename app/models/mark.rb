class Mark

  attr_accessor :marks_data, :last_updated

  def initialize(args)
    self.marks_data = args.delete(:marks_data)
    self.last_updated = args.delete(:last_updated)
  end

  def self.user_sending_updated_data?(current_user, last_updated)
    (current_user.last_updated.nil? ||
     current_user.last_updated < Time.parse(last_updated) &&
     (current_user.last_updated - Time.parse(last_updated)).abs > 1.0)
  end

  def self.user_sending_outdated_data?(current_user, last_updated)
    (!current_user.last_updated.nil? &&
     current_user.last_updated > Time.parse(last_updated) &&
     current_user.last_updated - Time.parse(last_updated) > 1.0)
  end

  def self.from_params(data)
    stored_data = JSON.parse(data)
    data_last_updated = stored_data.detect{|item| item['key']=='last_updated' }
    data_last_updated = data_last_updated && data_last_updated['val']
    Mark.new(:marks_data => stored_data, :last_updated => data_last_updated)
  end

  def as_hash
    {:last_updated => last_updated,
      :marks_data => marks_data.as_json.to_json}
  end

end
