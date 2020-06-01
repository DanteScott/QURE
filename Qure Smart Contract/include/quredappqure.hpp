#include <string>
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/singleton.hpp>

using namespace eosio;
using namespace std;

CONTRACT quredappqure : public contract {
  public:
    using contract::contract;

  quredappqure(eosio::name receiver, eosio::name code, datastream<const char*> ds)
  :contract(receiver, code, ds), _users(receiver, receiver.value), _events(receiver, receiver.value),
  _bounties(receiver, receiver.value), _hospitals(receiver, receiver.value), _config(receiver, receiver.value) {}
  

    ACTION login(name username);

    ACTION setconfig(      
      name contractself,
      name waxcontract,
      asset base_currency);

    ACTION claim(name username, asset amount_to_claim);

  [[eosio::on_notify("*::transfer")]] void paytoken(  
                    name from,
                    name to,
                    asset token_amount,
                    const string& memo);
  using transfer_action = action_wrapper<name("transfer"), &quredappqure::paytoken>;
  
 [[eosio::on_notify("eosio.token::transfer")]] void dummytransfer(eosio::name from, eosio::name to, eosio::asset quantity, std::string memo){paytoken(from,to,quantity,memo);} // This is a hack, otherwise the ontransfer function won't work


    ACTION createmeet(name username, name donate_to, string event_title, 
    string event_desc, string event_rules, string event_category, string dono_type,
    uint64_t max_participants, uint64_t start_time);

    ACTION reqjoin(name username, uint64_t event_id);

    ACTION reqmng(name username,bool accepted,
    name selected_user, uint64_t event_id);

    ACTION leavemeet(name username);

    ACTION hostrepdel(name username, name delinq_username);

    ACTION meetres(name username, bool is_host);

    ACTION initbounty(name username,
    string bounty_title, string bounty_desc, uint64_t max_hunters);

    ACTION inithosp(name new_hospital, string hosp_name
    , string hosp_desc);

    ACTION donate(name username, string dono_type, 
    uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount);

    ACTION bountyapp(name username, name bounty_host, string proof_link);

    ACTION bountyres(name username, vector<name> winners);





  private: 

    TABLE user_info {
      name    username;
      name    bounty_host;
      asset   balance;
      asset   donations;
      asset score;
      uint64_t hosted_bounty = 0;
      uint64_t hosted_meet = 0;
      uint64_t current_meet = 0;
      uint64_t current_bounty = 0;
      uint64_t attendance = 0;
      uint64_t events_started = 0;
      uint64_t bounties_completed = 0;
      uint64_t abandoned = 0;
      uint64_t delinq = 0;
      int event_slot = -1;
      int bounty_slot = -1;
      bool     is_hospital = 0;

      


      auto primary_key() const { return username.value; }
    };

    TABLE event_info {
      name    event_host;
      name    event_recip;
      asset host_score;
      asset   donations;
      asset   rewards;
      uint64_t unique_id;
      uint64_t start_time;
      uint64_t max_participants;
      uint64_t next_in_queue = 1;
      string  dono_type;
      string  event_category;
      string  event_rules;
      string  event_title;
      string  event_desc;
      vector<name> event_reqs;
      vector<name> participants;
      vector<name> delinq_slots;
      bool finalized = 0;


      auto primary_key() const { return unique_id; }
    };

    TABLE bounty_info {
      name    bounty_host;
      asset   bounty_amount;
      asset host_score;
      asset  bounty_balance;
      uint64_t max_hunters;
      uint64_t next_hunter = 0;
      string  bounty_title;
      string  bounty_desc;
      bool    bounty_finished = 0;
      vector<name> chosen_hunters;
      vector<name> app_hunters;
      vector<string> proof_urls;


      auto primary_key() const { return bounty_host.value; }
    };

    TABLE hospital_info {
      name    hosp_acc;
      string  hosp_name;
      string  hosp_desc;
      asset   donos_received;


      auto primary_key() const { return hosp_acc.value; }
    };

    TABLE config_info {
      name contractself;
      name waxcontract;
      asset base_currency;
      uint64_t unique_id_idx = 10000;

      auto primary_key() const {
      return contractself.value;
      }    };

    typedef multi_index<name("users"), user_info> users_table;
    typedef multi_index<name("events"), event_info> events_table;
    typedef multi_index<name("bounties"), bounty_info> bounties_table;
    typedef multi_index<name("hospitals"), hospital_info> hospitals_table;
    typedef multi_index<name("config"), config_info> config_table;

    users_table _users;
    events_table _events;
    bounties_table _bounties;
    hospitals_table _hospitals;
    config_table _config;

        void withdrawtokens(  const name  token_contract,
                    const name from,
                    const name to,
                    const asset token_amount,
                    const string memo);


};



