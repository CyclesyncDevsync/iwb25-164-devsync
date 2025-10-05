# Types for auction requests and responses

# Type for creating a new auction
public type CreateAuctionRequest record {|
    string material_id;
    string? workflow_id?;
    int supplier_id;
    string title;
    string description;
    string category;
    string? sub_category;
    decimal quantity;
    string unit;
    int? condition_rating?;
    int? quality_score?;
    decimal starting_price;
    decimal? reserve_price?;
    decimal? buy_it_now_price?;
    decimal? bid_increment = 100.00;
    string auction_type = "standard";
    int duration_days = 7;
    int time_extension_minutes = 10;
    string[]? photos?;
    json? verification_details?;
    string? agent_notes?;
    string? location?;
|};

# Type for auction response
public type AuctionResponse record {|
    string auction_id;
    string material_id;
    string? workflow_id;
    int supplier_id;
    string title;
    string description;
    string category;
    string? sub_category;
    decimal quantity;
    string unit;
    int condition_rating;
    int quality_score;
    decimal starting_price;
    decimal current_price;
    decimal? reserve_price;
    decimal? buy_it_now_price;
    decimal bid_increment;
    string auction_type;
    string status;
    string start_time;
    string end_time;
    int duration_days;
    int time_extension_minutes;
    int? highest_bidder_id;
    string? last_bid_time;
    int bid_count;
    int unique_bidders;
    string[]? photos;
    json? verification_details;
    string? agent_notes;
    string? location;
    boolean reserve_met;
    string created_at;
    string updated_at;
    string? completed_at;
|};

public type AuctionListResponse record {|
    AuctionResponse[] auctions;
    int total_count;
|};