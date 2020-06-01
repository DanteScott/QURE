#include "privatefunc.cpp"


ACTION quredappqure::login(name username) {
  require_auth(username);
  
  auto user = _users.find(username.value);
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
    
  
  if (user == _users.end()){
   //create new user 
      user = _users.emplace(username,  [&](auto& new_user) {
      new_user.username = username;
      new_user.balance = currentcfg.base_currency*0;
      new_user.donations = currentcfg.base_currency*0;
      new_user.score = currentcfg.base_currency*0;
      
    });
  } else {//get existing user
  check(0 > 1, "You are already registered");
  }

}

ACTION quredappqure::claim(name username, asset amount_to_claim){
  
  require_auth(username);
  
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  auto& user = _users.get(username.value, "User does not exist");

  check(amount_to_claim <= user.balance, "Your balance is too low");

  name fund_claimer = username;
  
  
  //normal withdraw               
  quredappqure::withdrawtokens(currentcfg.waxcontract,
                    get_self(),
                    fund_claimer,
                    amount_to_claim,
                    "wax withdraw");


  _users.modify(user, username, [&](auto& modified_user) {
  modified_user.balance -= amount_to_claim;
  });

  
}

ACTION quredappqure::createmeet(name username, name donate_to, string event_title, 
string event_desc, string event_rules, string event_category, string dono_type,
uint64_t max_participants, uint64_t start_time){
require_auth(username);
//require_auth(user);
  auto& user = _users.get(username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");

  check(user.hosted_meet == 0 && user.current_meet == 0, "You still have an event in progress.");
  check(dono_type == "hospital" || dono_type == "bounty",
       "Invalid Donation Type");

  auto event = _events.find(currentcfg.unique_id_idx);
   //create new user 
      event = _events.emplace(username,  [&](auto& new_event) {
      new_event.event_host = username;
      new_event.event_recip = donate_to;
      new_event.dono_type = dono_type;


      new_event.unique_id = currentcfg.unique_id_idx;
      new_event.host_score = user.score;
      new_event.start_time = current_time_point().sec_since_epoch()+start_time;
      new_event.max_participants = max_participants;
      new_event.event_category = event_category;
      new_event.event_rules = event_rules;
      new_event.event_title = event_title;
      new_event.event_desc = event_desc;
      new_event.donations = currentcfg.base_currency*0;
      new_event.rewards = currentcfg.base_currency*0;    
      new_event.event_reqs.resize(max_participants);
      new_event.participants.resize(max_participants);
    });

      _users.modify(user, username, [&](auto& mod_user) {
  mod_user.events_started++;
  mod_user.hosted_meet = currentcfg.unique_id_idx;
  mod_user.current_meet = currentcfg.unique_id_idx;
  });

  _config.modify(currentcfg, username, [&](auto& modified_config) {
  modified_config.unique_id_idx++;
  });

    
}

ACTION quredappqure::reqjoin(name username,uint64_t event_id){
require_auth(username);
  auto& user = _users.get(username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  auto& event = _events.get(event_id, "Event does not exist");

  check(user.current_meet == 0, "You are already in an event");

  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.delinq = 0;
  mod_user.event_slot = event.next_in_queue;
  });

  _events.modify(event, username, [&](auto& mod_event) {
  mod_event.event_reqs[event.next_in_queue] = username;
  mod_event.next_in_queue++;
  });


}


ACTION quredappqure::reqmng(name username,bool accepted,
name selected_user, uint64_t event_id){
//require_auth(user);
require_auth(username);
  auto& user = _users.get(selected_user.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  auto& event = _events.get(event_id, "This event does not exist");
 check(username == event.event_host, "You do not have authority for this event.");
 check(user.current_meet == 0, "User is already in an event");
 check(user.username == event.event_reqs[user.event_slot], "Invalid User");


  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.current_meet = event_id;
  mod_user.events_started++;
  });

  _events.modify(event, username, [&](auto& mod_event) {
  mod_event.participants[user.event_slot] = user.username;
  });
 
 

}


ACTION quredappqure::leavemeet(name username){

require_auth(username);
  auto& user = _users.get(username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  auto& event = _events.get(user.current_meet, "Event does not exist");
 check(username == event.event_host, "You do not have authority for this event.");
 check(user.current_meet != 0, "User is already in an event");
 check(user.username == event.participants[user.event_slot], "Invalid User");

  _events.modify(event, username, [&](auto& mod_event) {
  mod_event.participants[user.event_slot] = ""_n; 
  });
  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.current_meet = 0;
  mod_user.event_slot = -1;
  mod_user.abandoned++;
  mod_user.attendance = 100-((mod_user.abandoned/mod_user.events_started)*100);
  });

}

ACTION quredappqure::hostrepdel(name username, name delinq_username){
require_auth(username);
  auto& user = _users.get(username.value, "User does not exist");
  auto& delinq_user = _users.get(delinq_username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  auto& event = _events.get(user.hosted_meet, "Event does not exist");
  check(username == event.event_host, "Invalid Event");
  check(delinq_user.current_meet == event.unique_id, "This user is not in this event");

  _users.modify(delinq_user, username, [&](auto& mod_user) {
  mod_user.current_meet = 0;
  mod_user.delinq = 1;
  });
}

ACTION quredappqure::meetres(name username, bool is_host){

require_auth(username);
  auto& user = _users.get(username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");


  if(is_host == 1){


  auto& event = _events.get(user.hosted_meet, "Event does not exist");
  if(event.dono_type == "hospital"){
  auto& dono_recip = _hospitals.get(event.event_recip.value, "Hospital does not exist");
  auto& dono_user = _users.get(event.event_recip.value, "Hospital user does not exist");
  _hospitals.modify(dono_recip, username, [&](auto& mod_hosp) {
  mod_hosp.donos_received+=((4/10)*event.donations);
  });
  _users.modify(dono_user, username, [&](auto& mod_user) {
  mod_user.balance+=((4/10)*event.donations);
  });
  } else {
  auto& dono_recip = _bounties.get(event.event_recip.value, "Bounty does not exist");
  auto& dono_user = _users.get(event.event_recip.value, "Bounty user does not exist");
  _bounties.modify(dono_recip, username, [&](auto& mod_bounty) {
  mod_bounty.bounty_amount+=((4/10)*event.donations);
  });
  }
  check(username == event.event_host, "Invalid Event");
  check(event.finalized == 0, "This event has already ended");
  //give host reward
  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.balance+=((1/event.participants.size())*((6/10)*event.donations));
  mod_user.current_meet = 0;
  mod_user.hosted_meet = 0;
  });

  _events.modify(event, username, [&](auto& mod_event) {
  mod_event.finalized = 1; 
  });


  } else {
  auto& event = _events.get(user.current_meet, "Event does not exist");
  check(event.finalized == 1, "This event has not been finalized");

    _users.modify(user, username, [&](auto& mod_user) {
  mod_user.balance+=((1/event.participants.size())*event.donations);
  mod_user.score+=((1/event.participants.size())*event.donations)*10;
  mod_user.current_meet = 0;
  });
  }

}

ACTION quredappqure::initbounty(name username,
string bounty_title, string bounty_desc, uint64_t max_hunters){

require_auth(username);
//require_auth(user);
  auto& user = _users.get(username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");

  check(user.hosted_bounty == 0, "You still have a bounty in progress.");

  auto bounty = _bounties.find(username.value);
   //create new bounty 
      bounty = _bounties.emplace(username,  [&](auto& new_bounty) {
      new_bounty.bounty_host = username;
      new_bounty.bounty_amount = currentcfg.base_currency*0;
      new_bounty.host_score = user.score;
      new_bounty.max_hunters = max_hunters;
      new_bounty.bounty_title = bounty_title;
      new_bounty.bounty_balance = currentcfg.base_currency*0;
      new_bounty.bounty_desc = bounty_desc;
      new_bounty.chosen_hunters.resize(max_hunters);
      new_bounty.app_hunters.resize(max_hunters);

    });

      _users.modify(user, username, [&](auto& mod_user) {
  mod_user.hosted_bounty = username.value;
  });
}


ACTION quredappqure::inithosp(name new_hospital, string hosp_name
, string hosp_desc){
//require_auth(get_self());
require_auth(get_self());
//require_auth(user);
  auto& hospital_user = _users.get(new_hospital.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");

  check(hospital_user.is_hospital == 0, "User is already a registered hospital");

  auto hospital = _hospitals.find(new_hospital.value);
   //create new bounty 
      hospital = _hospitals.emplace(get_self(),  [&](auto& new_hosp) {
      new_hosp.hosp_acc = new_hospital;
      new_hosp.hosp_name = hosp_name;
      new_hosp.hosp_desc = hosp_desc;
      new_hosp.donos_received = currentcfg.base_currency*0;

    });

  _users.modify(hospital_user, get_self(), [&](auto& mod_user) {
  mod_user.is_hospital = 1;
  });
}

ACTION quredappqure::donate(name username, string dono_type, 
uint64_t event_id, name bounty_id, name hosp_id, asset dono_amount){
//require_auth(user);
require_auth(username);
//require_auth(user);
  auto& user = _users.get(username.value, "User does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");
  check(dono_type == "event" || dono_type == "hospital" 
  || dono_type == "bounty", "Invalid donation type");
  check(dono_amount <= user.balance, "Your balance is too low for this TX");
  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.balance-= dono_amount;
  mod_user.donations+= dono_amount;
  });
  if(dono_type == "event"){
      auto& event = _events.get(event_id, "Event does not exist");
      check(event.finalized == 0, "This event has ended.");
        _events.modify(event, username, [&](auto& mod_event) {
        mod_event.rewards+= dono_amount; 
        });
  } else if (dono_type == "hospital"){
      auto& hospital = _hospitals.get(hosp_id.value, "Hospital does not exist");
      auto& hospital_user = _users.get(hospital.hosp_acc.value, "Hospital User does not exist");
        _hospitals.modify(hospital, username, [&](auto& mod_hosp) {
        mod_hosp.donos_received+= dono_amount; 
        });
        _users.modify(hospital_user, username, [&](auto& mod_user) {
        mod_user.balance+= dono_amount;
        });
  } else if (dono_type == "bounty"){
      auto& bounty = _bounties.get(bounty_id.value, "Bounty does not exist");
        _bounties.modify(bounty, username, [&](auto& mod_bounty) {
        mod_bounty.bounty_balance+= dono_amount; 
        });
  }

}

ACTION quredappqure::bountyapp(name username, name bounty_host, string proof_link){
//require_auth(user);
require_auth(username);
  auto& user = _users.get(username.value, "User does not exist");
  auto& bounty = _bounties.get(bounty_host.value, "Bounty does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");

  check(bounty.app_hunters[user.bounty_slot] != username, "You already applied for this bounty");
  check(user.bounty_slot == -1, "You are already in a bounty");

  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.bounty_slot = bounty.next_hunter;
  mod_user.current_bounty = bounty_host.value;
  mod_user.bounty_host = bounty_host;
  });
  _bounties.modify(bounty, username, [&](auto& mod_bounty) {
  mod_bounty.app_hunters[mod_bounty.next_hunter] = username;
  mod_bounty.proof_urls[mod_bounty.next_hunter] = proof_link;
  mod_bounty.next_hunter++; 
  });

}

ACTION quredappqure::bountyres(name username, vector<name> winners){
//require_auth(user);
require_auth(username);
  auto& user = _users.get(username.value, "User does not exist");
  auto& bounty = _bounties.get(username.value, "Bounty does not exist");
  auto& currentcfg = _config.get(get_self().value, "Config does not exist");

check(username == bounty.bounty_host, "You are not the host");
  _users.modify(user, username, [&](auto& mod_user) {
  mod_user.bounty_slot = -1;
  mod_user.current_bounty = 0;
  mod_user.bounty_host = ""_n;
  });

    uint64_t bounty_idx = 0;
  
  for(;winners.size() != bounty_idx+1;){
    
    bounty_idx++;
    auto& thiswinner = _users.get(winners[bounty_idx].value, "User doesn't exist");
    check(thiswinner.bounty_host == bounty.bounty_host, "Invalid winner");
  _users.modify(thiswinner, username, [&](auto& mod_user) {
  mod_user.balance+= (1/winners.size())*bounty.bounty_balance;
  mod_user.score+= ((1/winners.size())*bounty.bounty_balance)*10;
  mod_user.bounty_slot = -1;
  mod_user.current_bounty = 0;
  mod_user.bounty_host = ""_n;
  mod_user.bounties_completed++;
  });
  }
  
_bounties.erase(bounty);

}

ACTION quredappqure::setconfig(
      name contractself,
      name waxcontract,
      asset base_currency
      ) {
        
        require_auth(get_self());
        
        auto cfg = _config.find(get_self().value);
    
    if (cfg == _config.end()){
      
      cfg = _config.emplace(get_self(),  [&](auto& new_cfg) {
      new_cfg.contractself = get_self();
      new_cfg.waxcontract = waxcontract;
      new_cfg.base_currency = base_currency;
      
    });
    
  } else{
    
    auto& currentcfg = _config.get(get_self().value, "Config does not exist");
    
    _config.modify(currentcfg, get_self(), [&](auto& modified_cfg) {
  
    modified_cfg.waxcontract = waxcontract;
    modified_cfg.base_currency = base_currency;

    });
    
    }
    
  }


