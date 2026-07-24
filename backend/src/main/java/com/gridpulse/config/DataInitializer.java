package com.gridpulse.config;

import com.gridpulse.entity.*;
import com.gridpulse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String JOHN_DOE = "john_doe";
    private static final String JANE_SMITH = "jane_smith";
    private static final String DAVID_MILLER = "david_miller";
    private static final String NAME_JOHN_DOE = "John Doe";
    private static final String NAME_JANE_SMITH = "Jane Smith";
    private static final String NAME_DAVID_MILLER = "David Miller";
    private static final String ROLE_TECHNICIAN = "TECHNICIAN";
    private static final String STATUS_AVAILABLE = "AVAILABLE";
    private static final String STATUS_ACTIVE = "Active";

    @Value("${gridpulse.seed.admin-password}")
    private String adminPassword;

    @Value("${gridpulse.seed.operator-password}")
    private String operatorPassword;

    @Value("${gridpulse.seed.technician-password}")
    private String tempPassword;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubstationRepository substationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private RepairHistoryRepository repairHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@gridpulse.com")
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName("Systems Administrator")
                    .role("ADMIN")
                    .passwordChanged(true)
                    .build();

            User operator = User.builder()
                    .username("operator")
                    .email("operator@gridpulse.com")
                    .password(passwordEncoder.encode(operatorPassword))
                    .fullName("Grid Operator One")
                    .role("GRID_OPERATOR")
                    .passwordChanged(true)
                    .build();

            User uTech1 = User.builder()
                    .username(JOHN_DOE)
                    .email("john@gridpulse.com")
                    .password(passwordEncoder.encode(tempPassword))
                    .fullName(NAME_JOHN_DOE)
                    .role(ROLE_TECHNICIAN)
                    .passwordChanged(false)
                    .build();

            User uTech2 = User.builder()
                    .username(JANE_SMITH)
                    .email("jane@gridpulse.com")
                    .password(passwordEncoder.encode(tempPassword))
                    .fullName(NAME_JANE_SMITH)
                    .role(ROLE_TECHNICIAN)
                    .passwordChanged(false)
                    .build();

            User uTech3 = User.builder()
                    .username(DAVID_MILLER)
                    .email("david@gridpulse.com")
                    .password(passwordEncoder.encode(tempPassword))
                    .fullName(NAME_DAVID_MILLER)
                    .role(ROLE_TECHNICIAN)
                    .passwordChanged(false)
                    .build();

            userRepository.saveAll(Arrays.asList(admin, operator, uTech1, uTech2, uTech3));
            log.info("Seeded default users with environment configured credentials.");
        }


        if (substationRepository.count() == 0) {
            class StateGridData {
                String name;
                String location;
                double lat;
                double lon;
                double capacity;
                String desc;

                StateGridData(String name, String location, double lat, double lon, double capacity, String desc) {
                    this.name = name;
                    this.location = location;
                    this.lat = lat;
                    this.lon = lon;
                    this.capacity = capacity;
                    this.desc = desc;
                }
            }

            StateGridData[] defaultGrids = new StateGridData[]{
                    new StateGridData("Andhra Pradesh State Grid", "Vijayawada", 16.5062, 80.6480, 4200.0, "Primary distribution for coastal and southern districts."),
                    new StateGridData("Arunachal Pradesh State Grid", "Itanagar", 27.0844, 93.6053, 350.0, "Hydel-heavy grid serving high-altitude regions."),
                    new StateGridData("Assam State Grid", "Guwahati", 26.1445, 91.7362, 1850.0, "Brahmaputra valley distribution network."),
                    new StateGridData("Bihar State Grid", "Patna", 25.5941, 85.1376, 3100.0, "Densely populated rural and urban feeder grid."),
                    new StateGridData("Chhattisgarh State Grid", "Raipur", 21.2514, 81.6296, 5500.0, "Generation surplus heavy-industrial transmission hub."),
                    new StateGridData("Goa State Grid", "Panaji", 15.4909, 73.8278, 450.0, "Coastal tourist belt and iron-ore processing distribution."),
                    new StateGridData("Gujarat State Grid", "Gandhinagar", 23.2156, 72.6369, 8200.0, "High-reliability industrial grid with heavy solar capacity."),
                    new StateGridData("Haryana State Grid", "Panchkula", 30.6942, 76.8606, 3800.0, "NCR agricultural and industrial manufacturing corridor."),
                    new StateGridData("Himachal Pradesh State Grid", "Shimla", 31.1048, 77.1734, 1200.0, "Run-of-the-river hydro generation import/export grid."),
                    new StateGridData("Jharkhand State Grid", "Ranchi", 23.3441, 85.3096, 3400.0, "Steel plant and coal mining primary transmission lines."),
                    new StateGridData("Karnataka State Grid", "Bengaluru", 12.9716, 77.5946, 7100.0, "Tech sector and manufacturing distribution network."),
                    new StateGridData("Kerala State Grid", "Trivandrum", 8.5241, 76.9366, 2100.0, "Hydro-centric green power transmission corridor."),
                    new StateGridData("Madhya Pradesh State Grid", "Bhopal", 23.2599, 77.4126, 6800.0, "Central Indian cross-state high-voltage transit hub."),
                    new StateGridData("Maharashtra State Grid", "Mumbai", 19.0760, 72.8777, 9800.0, "Highest capacity load center grid in the country."),
                    new StateGridData("Manipur State Grid", "Imphal", 24.8170, 93.9368, 280.0, "North-Eastern border area radial transmission grid."),
                    new StateGridData("Meghalaya State Grid", "Shillong", 25.5788, 91.8831, 320.0, "Hilly terrain distribution network."),
                    new StateGridData("Mizoram State Grid", "Aizawl", 23.7271, 92.7176, 190.0, "Low-load mountain village distribution systems."),
                    new StateGridData("Nagaland State Grid", "Kohima", 25.6751, 94.1086, 210.0, "Assam border inter-tied valley grid system."),
                    new StateGridData("Odisha State Grid", "Bhubaneswar", 20.2961, 85.8245, 4100.0, "Cyclone-resilient coastal high-voltage network."),
                    new StateGridData("Punjab State Grid", "Patiala", 30.3398, 76.3869, 4400.0, "High-demand agricultural pump set distribution grid."),
                    new StateGridData("Rajasthan State Grid", "Jaipur", 26.9124, 75.7873, 6900.0, "Desert solar corridor transmission network."),
                    new StateGridData("Sikkim State Grid", "Gangtok", 27.3314, 88.6138, 250.0, "Teesta river basin hydro generator evacuation lines."),
                    new StateGridData("Tamil Nadu State Grid", "Chennai", 13.0827, 80.2707, 8500.0, "Wind energy surplus manufacturing and commercial grid."),
                    new StateGridData("Telangana State Grid", "Hyderabad", 17.3850, 78.4867, 5900.0, "Agricultural lift irrigation and pharma sector feeder grid."),
                    new StateGridData("Tripura State Grid", "Agartala", 23.8315, 91.2868, 300.0, "Gas-evacuation thermal grid supplying adjacent grids."),
                    new StateGridData("Uttar Pradesh State Grid", "Lucknow", 26.8467, 80.9462, 9200.0, "Densely linked northern interstate transit supergrid."),
                    new StateGridData("Uttarakhand State Grid", "Dehradun", 30.3165, 78.0322, 1100.0, "Ganges basin hydro export network."),
                    new StateGridData("West Bengal State Grid", "Kolkata", 22.5726, 88.3639, 5800.0, "East-coast industrial and cross-border Bangladesh link.")
            };

            java.util.List<Substation> substations = new java.util.ArrayList<>();
            for (StateGridData data : defaultGrids) {
                substations.add(Substation.builder()
                        .name(data.name)
                        .location(data.location)
                        .latitude(data.lat)
                        .longitude(data.lon)
                        .status("HEALTHY")
                        .maxCapacityKw(data.capacity)
                        .description(data.desc)
                        .build());
            }

            substationRepository.saveAll(substations);
            log.info("Seeded all 28 Indian state grid substations successfully.");
        }


        if (technicianRepository.count() == 0) {
            User uTech1 = userRepository.findByUsername(JOHN_DOE).orElse(null);
            User uTech2 = userRepository.findByUsername(JANE_SMITH).orElse(null);
            User uTech3 = userRepository.findByUsername(DAVID_MILLER).orElse(null);

            if (uTech1 == null) {
                uTech1 = userRepository.save(User.builder().username(JOHN_DOE).email("john@gridpulse.com").password(passwordEncoder.encode(tempPassword)).fullName(NAME_JOHN_DOE).role(ROLE_TECHNICIAN).passwordChanged(false).build());
            }
            if (uTech2 == null) {
                uTech2 = userRepository.save(User.builder().username(JANE_SMITH).email("jane@gridpulse.com").password(passwordEncoder.encode(tempPassword)).fullName(NAME_JANE_SMITH).role(ROLE_TECHNICIAN).passwordChanged(false).build());
            }
            if (uTech3 == null) {
                uTech3 = userRepository.save(User.builder().username(DAVID_MILLER).email("david@gridpulse.com").password(passwordEncoder.encode(tempPassword)).fullName(NAME_DAVID_MILLER).role(ROLE_TECHNICIAN).passwordChanged(false).build());
            }

            Technician tech1 = Technician.builder()
                    .user(uTech1)
                    .employeeId("TECH-001")
                    .fullName(NAME_JOHN_DOE)
                    .phone("+91-9876543210")
                    .specialization("Transformer Maintenance, Substation Automation")
                    .availability(STATUS_AVAILABLE)
                    .experience(5)
                    .rating(4.8)
                    .currentJobs(0)
                    .currentLatitude(12.9716)
                    .currentLongitude(77.5946)
                    .status(STATUS_ACTIVE)
                    .build();

            Technician tech2 = Technician.builder()
                    .user(uTech2)
                    .employeeId("TECH-002")
                    .fullName(NAME_JANE_SMITH)
                    .phone("+91-8765432109")
                    .specialization("Cable Repair, High Voltage Breakers")
                    .availability(STATUS_AVAILABLE)
                    .experience(7)
                    .rating(4.9)
                    .currentJobs(0)
                    .currentLatitude(13.0827)
                    .currentLongitude(80.2707)
                    .status(STATUS_ACTIVE)
                    .build();

            Technician tech3 = Technician.builder()
                    .user(uTech3)
                    .employeeId("TECH-003")
                    .fullName(NAME_DAVID_MILLER)
                    .phone("+91-7654321098")
                    .specialization("Grid Protection Systems, Telecom Diagnostics")
                    .availability(STATUS_AVAILABLE)
                    .experience(4)
                    .rating(4.7)
                    .currentJobs(0)
                    .currentLatitude(17.3850)
                    .currentLongitude(78.4867)
                    .status(STATUS_ACTIVE)
                    .build();

            technicianRepository.saveAll(Arrays.asList(tech1, tech2, tech3));
            log.info("Seeded 3 technicians linked to individual accounts.");
        }


        if (customerRepository.count() == 0) {
            Customer cust1 = Customer.builder()
                    .name("Alice Johnson")
                    .email("alice.j@example.com")
                    .phone("+91-9988776655")
                    .address("Jayanagar 4th Block, #120")
                    .accountNumber("GP-1001")
                    .status("ACTIVE")
                    .averageConsumptionKwh(340.5)
                    .build();

            Customer cust2 = Customer.builder()
                    .name("Vertex Tech Corp")
                    .email("facilities@vertextech.com")
                    .phone("+91-8877665544")
                    .address("Whitefield IT Zone, Building 4B")
                    .accountNumber("GP-1002")
                    .status("ACTIVE")
                    .averageConsumptionKwh(8450.0)
                    .build();

            Customer cust3 = Customer.builder()
                    .name("Bob Smith")
                    .email("bob.smith@example.com")
                    .phone("+91-7766554433")
                    .address("Indiranagar 12th Cross, #45")
                    .accountNumber("GP-1003")
                    .status("ACTIVE")
                    .averageConsumptionKwh(410.2)
                    .build();

            customerRepository.saveAll(Arrays.asList(cust1, cust2, cust3));
            log.info("Seeded default customers.");
        }


        if (repairHistoryRepository.count() == 0) {
            RepairHistory hist1 = RepairHistory.builder()
                    .substationId(1L)
                    .substationName("Metro Grid Substation A")
                    .faultResolved("Transformer winding replacement")
                    .technicianName("John Doe")
                    .completedAt(LocalDateTime.now().minusMonths(9))
                    .notes("Transformer overheated due to winding insulation failure. Replaced primary winding.")
                    .build();

            RepairHistory hist2 = RepairHistory.builder()
                    .substationId(1L)
                    .substationName("Metro Grid Substation A")
                    .faultResolved("High-voltage cable splice repair")
                    .technicianName("Jane Smith")
                    .completedAt(LocalDateTime.now().minusYears(2))
                    .notes("Underground feeder cable short circuit. Spliced section between terminal A and pole.")
                    .build();

            RepairHistory hist3 = RepairHistory.builder()
                    .substationId(2L)
                    .substationName("Industrial Hub Substation B")
                    .faultResolved("Cooling system pump renewal")
                    .technicianName("John Doe")
                    .completedAt(LocalDateTime.now().minusMonths(3))
                    .notes("Substation cooling fluid pump seized. Replaced with new brushless pump motor.")
                    .build();

            repairHistoryRepository.saveAll(Arrays.asList(hist1, hist2, hist3));
            log.info("Seeded repair logs for AI historical diagnostic retrieval.");
        }
    }
}
