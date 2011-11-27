class UpdateMarksData < ActiveRecord::Migration
  def self.up
    say_with_time("upgrade all users to have the new marks data format") do
      users = User.all
      users.each do |user|
        if user.marks_data && user.last_updated
          updated_data = (JSON.parse(user.marks_data) + [{:key => 'last_updated',
                                                           :val => user.last_updated}]).to_json
          user.update_attributes!(:marks_data => updated_data)
        end
      end
    end
  end

  def self.down
    raise "nope not undoing"
  end
end
