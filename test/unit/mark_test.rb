require File.expand_path('../test_helper', File.dirname(__FILE__))

class UserTest < ActiveSupport::TestCase
  
  test "creates a valid mark" do
    time = Time.now
    mark = Mark.new( {:last_updated => time,
                :marks_data => [].to_json})
    assert_equal time, mark.last_updated
  end

end
