require File.expand_path('../test_helper', File.dirname(__FILE__))

class UserTest < ActiveSupport::TestCase
  
  test "creates a valid mark" do
    time = Time.now
    mark = Mark.new( {:last_updated => time,
                :marks_data => []})
    assert_equal time, mark.last_updated
  end

  test "creates a valid mark from params" do
    time = Time.now
    mark = Mark.from_params([{'key' => 'last_updated', 'val' => time},
                             {'key' => '11-15-2011', 'val' => true}].to_json)
    assert_equal time.to_i, Time.parse(mark.last_updated).to_i
    assert_equal [{"val"=>true, "key"=>"11-15-2011"}], mark.marks_data
  end

  test "creates returns as_hash" do
    time = Time.now
    mark = Mark.new( {:last_updated => time,
                :marks_data => []})
    assert_equal time, mark.as_hash[:last_updated]
    assert_equal [], JSON.parse(mark.as_hash[:marks_data])
  end

end
